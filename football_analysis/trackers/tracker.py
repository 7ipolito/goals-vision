from ultralytics import YOLO
import supervision as sv
import pickle
import os
import numpy as np
import pandas as pd
import cv2
import sys 
sys.path.append('../')
from utils import get_center_of_bbox, get_bbox_width, get_foot_position

class Tracker:
    def __init__(self, model_path):
        self.model = YOLO(model_path) 
        self.tracker = sv.ByteTrack()

        # ID Stabilization system
        self.player_history = {}  # {original_id: [positions, last_seen_frame, stable_id]}
        self.id_mapping = {}  # {current_id: stable_id}
        self.next_stable_id = 1
        self.max_distance_threshold = 100  # pixels - adjust based on video resolution
        self.max_frames_missing = 30  # frames before considering player truly gone
        self.position_smoothing = True  # Use position smoothing for better tracking
        
    def configure_stabilization(self, video_width=1920, video_height=1080, fps=24):
        """Configure stabilization parameters based on video characteristics"""
        # Adjust distance threshold based on resolution
        base_threshold = 100
        resolution_factor = ((video_width * video_height) / (1920 * 1080)) ** 0.5
        self.max_distance_threshold = int(base_threshold * resolution_factor)
        
        # Adjust frame tolerance based on FPS
        base_frames = 30
        fps_factor = fps / 24
        self.max_frames_missing = int(base_frames * fps_factor)
        
        print(f"🔧 Estabilização configurada:")
        print(f"   • Limiar de distância: {self.max_distance_threshold} pixels")
        print(f"   • Tolerância: {self.max_frames_missing} frames")

    def add_position_to_tracks(sekf,tracks):
        for object, object_tracks in tracks.items():
            for frame_num, track in enumerate(object_tracks):
                for track_id, track_info in track.items():
                    bbox = track_info['bbox']
                    if object == 'ball':
                        position= get_center_of_bbox(bbox)
                    else:
                        position = get_foot_position(bbox)
                    tracks[object][frame_num][track_id]['position'] = position

    def interpolate_ball_positions(self,ball_positions):
        ball_positions = [x.get(1,{}).get('bbox',[]) for x in ball_positions]
        df_ball_positions = pd.DataFrame(ball_positions,columns=['x1','y1','x2','y2'])

        # Interpolate missing values
        df_ball_positions = df_ball_positions.interpolate()
        df_ball_positions = df_ball_positions.bfill()

        ball_positions = [{1: {"bbox":x}} for x in df_ball_positions.to_numpy().tolist()]

        return ball_positions

    def detect_frames(self, frames):
        batch_size=20 
        detections = [] 
        for i in range(0,len(frames),batch_size):
            detections_batch = self.model.predict(frames[i:i+batch_size],conf=0.1)
            detections += detections_batch
        return detections

    def get_object_tracks(self, frames, read_from_stub=False, stub_path=None):
        
        if read_from_stub and stub_path is not None and os.path.exists(stub_path):
            with open(stub_path,'rb') as f:
                tracks = pickle.load(f)
            return tracks

        detections = self.detect_frames(frames)

        tracks={
            "players":[],
            "referees":[],
            "ball":[]
        }

        for frame_num, detection in enumerate(detections):
            cls_names = detection.names
            cls_names_inv = {v:k for k,v in cls_names.items()}

            # Covert to supervision Detection format
            detection_supervision = sv.Detections.from_ultralytics(detection)

            # Convert GoalKeeper to player object
            for object_ind , class_id in enumerate(detection_supervision.class_id):
                if cls_names[class_id] == "goalkeeper":
                    detection_supervision.class_id[object_ind] = cls_names_inv["player"]

            # Track Objects
            detection_with_tracks = self.tracker.update_with_detections(detection_supervision)

            tracks["players"].append({})
            tracks["referees"].append({})
            tracks["ball"].append({})

            # Collect player detections for stabilization
            raw_player_detections = {}

            for frame_detection in detection_with_tracks:
                bbox = frame_detection[0].tolist()
                cls_id = frame_detection[3]
                track_id = frame_detection[4]

                if cls_id == cls_names_inv['player']:
                    raw_player_detections[track_id] = {"bbox":bbox}
                
                if cls_id == cls_names_inv['referee']:
                    tracks["referees"][frame_num][track_id] = {"bbox":bbox}
            
            # Apply ID stabilization to players
            stabilized_players = self.stabilize_player_ids(raw_player_detections, frame_num)
            tracks["players"][frame_num] = stabilized_players
            
            for frame_detection in detection_supervision:
                bbox = frame_detection[0].tolist()
                cls_id = frame_detection[3]

                if cls_id == cls_names_inv['ball']:
                    tracks["ball"][frame_num][1] = {"bbox":bbox}

        if stub_path is not None:
            with open(stub_path,'wb') as f:
                pickle.dump(tracks,f)

        return tracks
    
    def draw_ellipse(self,frame,bbox,color,track_id=None):
        y2 = int(bbox[3])
        x_center, _ = get_center_of_bbox(bbox)
        width = get_bbox_width(bbox)

        cv2.ellipse(
            frame,
            center=(x_center,y2),
            axes=(int(width), int(0.35*width)),
            angle=0.0,
            startAngle=-45,
            endAngle=235,
            color = color,
            thickness=2,
            lineType=cv2.LINE_4
        )

        rectangle_width = 40
        rectangle_height=20
        x1_rect = x_center - rectangle_width//2
        x2_rect = x_center + rectangle_width//2
        y1_rect = (y2- rectangle_height//2) +15
        y2_rect = (y2+ rectangle_height//2) +15

        if track_id is not None:
            cv2.rectangle(frame,
                          (int(x1_rect),int(y1_rect) ),
                          (int(x2_rect),int(y2_rect)),
                          color,
                          cv2.FILLED)
            
            x1_text = x1_rect+12
            if track_id > 99:
                x1_text -=10
            
            cv2.putText(
                frame,
                f"{track_id}",
                (int(x1_text),int(y1_rect+15)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0,0,0),
                2
            )

        return frame

    def draw_traingle(self,frame,bbox,color):
        y= int(bbox[1])
        x,_ = get_center_of_bbox(bbox)

        triangle_points = np.array([
            [x,y],
            [x-10,y-20],
            [x+10,y-20],
        ])
        cv2.drawContours(frame, [triangle_points],0,color, cv2.FILLED)
        cv2.drawContours(frame, [triangle_points],0,(0,0,0), 2)

        return frame

    def draw_team_ball_control(self,frame,frame_num,team_ball_control):
        # Draw a semi-transparent rectaggle 
        overlay = frame.copy()
        cv2.rectangle(overlay, (1350, 850), (1900,970), (255,255,255), -1 )
        alpha = 0.4
        cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)

        team_ball_control_till_frame = team_ball_control[:frame_num+1]
        # Get the number of time each team had ball control
        team_1_num_frames = team_ball_control_till_frame[team_ball_control_till_frame==1].shape[0]
        team_2_num_frames = team_ball_control_till_frame[team_ball_control_till_frame==2].shape[0]
        team_1 = team_1_num_frames/(team_1_num_frames+team_2_num_frames)
        team_2 = team_2_num_frames/(team_1_num_frames+team_2_num_frames)

        cv2.putText(frame, f"Team 1 Ball Control: {team_1*100:.2f}%",(1400,900), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,0), 3)
        cv2.putText(frame, f"Team 2 Ball Control: {team_2*100:.2f}%",(1400,950), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,0), 3)

        return frame

    def draw_annotations(self,video_frames, tracks,team_ball_control, highlighted_players=None):
        output_video_frames= []
        for frame_num, frame in enumerate(video_frames):
            frame = frame.copy()

            # Check if frame_num is within bounds for all track types
            if (frame_num >= len(tracks["players"]) or 
                frame_num >= len(tracks["ball"]) or 
                frame_num >= len(tracks["referees"])):
                output_video_frames.append(frame)
                continue

            player_dict = tracks["players"][frame_num]
            ball_dict = tracks["ball"][frame_num]
            referee_dict = tracks["referees"][frame_num]

            # Draw Players
            for track_id, player in player_dict.items():
                color = player.get("team_color",(0,0,255))
                
                # Highlight the chosen players with different colors
                if highlighted_players is not None and track_id in highlighted_players:
                    # Get player index for color variation
                    player_index = highlighted_players.index(track_id)
                    highlight_colors = [
                        (0, 255, 255),    # Yellow (Cyan)
                        (255, 0, 255),    # Magenta
                        (0, 255, 0),      # Green
                        (255, 165, 0),    # Orange
                        (255, 0, 0),      # Red
                        (128, 0, 128),    # Purple
                        (0, 128, 255),    # Light Blue
                        (255, 255, 0)     # Bright Yellow
                    ]
                    highlight_color = highlight_colors[player_index % len(highlight_colors)]
                    
                    # Draw a special highlight for the chosen player
                    bbox = player["bbox"]
                    cv2.rectangle(frame, 
                                (int(bbox[0]-5), int(bbox[1]-5)), 
                                (int(bbox[2]+5), int(bbox[3]+5)), 
                                highlight_color, 4)  # Colored highlight
                    color = highlight_color  # Use highlight color
                
                frame = self.draw_ellipse(frame, player["bbox"],color, track_id)

                if player.get('has_ball',False):
                    frame = self.draw_traingle(frame, player["bbox"],(0,0,255))

            # Draw Referee
            for _, referee in referee_dict.items():
                frame = self.draw_ellipse(frame, referee["bbox"],(0,255,255))
            
            # Draw ball 
            for track_id, ball in ball_dict.items():
                frame = self.draw_traingle(frame, ball["bbox"],(0,255,0))


            # Draw Team Ball Control
            frame = self.draw_team_ball_control(frame, frame_num, team_ball_control)

            output_video_frames.append(frame)

        return output_video_frames

    def stabilize_player_ids(self, detections, frame_num):
        """Maintain consistent player IDs throughout the video"""
        stabilized_detections = {}
        current_positions = {}
        
        # Get current positions
        for track_id, detection in detections.items():
            if 'bbox' in detection:
                center = get_center_of_bbox(detection['bbox'])
                current_positions[track_id] = center
        
        # Update history and handle missing players
        for original_id in list(self.player_history.keys()):
            history = self.player_history[original_id]
            if frame_num - history['last_seen'] > self.max_frames_missing:
                # Player has been missing too long, remove from history
                if history['stable_id'] in self.id_mapping.values():
                    # Remove from current mapping
                    keys_to_remove = [k for k, v in self.id_mapping.items() if v == history['stable_id']]
                    for key in keys_to_remove:
                        del self.id_mapping[key]
                del self.player_history[original_id]
        
        # Process current detections
        for track_id, detection in detections.items():
            if 'bbox' not in detection:
                continue
                
            center = get_center_of_bbox(detection['bbox'])
            stable_id = None
            
            # Check if this track_id already has a stable mapping
            if track_id in self.id_mapping:
                stable_id = self.id_mapping[track_id]
            else:
                # Try to find the closest player from history
                min_distance = float('inf')
                best_match_id = None
                
                for original_id, history in self.player_history.items():
                    if frame_num - history['last_seen'] <= self.max_frames_missing:
                        # Calculate distance from last known position
                        last_pos = history['positions'][-1] if history['positions'] else None
                        if last_pos:
                            distance = np.sqrt((center[0] - last_pos[0])**2 + (center[1] - last_pos[1])**2)
                            if distance < min_distance and distance < self.max_distance_threshold:
                                min_distance = distance
                                best_match_id = original_id
                
                if best_match_id:
                    # Reassign to existing stable ID
                    stable_id = self.player_history[best_match_id]['stable_id']
                    self.id_mapping[track_id] = stable_id
                    
                    # Update history
                    self.player_history[best_match_id]['positions'].append(center)
                    self.player_history[best_match_id]['last_seen'] = frame_num
                    
                    # Keep position history manageable
                    if len(self.player_history[best_match_id]['positions']) > 10:
                        self.player_history[best_match_id]['positions'] = self.player_history[best_match_id]['positions'][-10:]
                else:
                    # Create new stable ID
                    stable_id = self.next_stable_id
                    self.next_stable_id += 1
                    self.id_mapping[track_id] = stable_id
                    
                    # Add to history
                    self.player_history[track_id] = {
                        'positions': [center],
                        'last_seen': frame_num,
                        'stable_id': stable_id
                    }
            
            # Update existing history
            if track_id in self.player_history:
                self.player_history[track_id]['positions'].append(center)
                self.player_history[track_id]['last_seen'] = frame_num
                
                # Keep position history manageable
                if len(self.player_history[track_id]['positions']) > 10:
                    self.player_history[track_id]['positions'] = self.player_history[track_id]['positions'][-10:]
            
            # Create stabilized detection with stable ID
            stabilized_detection = detection.copy()
            stabilized_detections[stable_id] = stabilized_detection
        
        return stabilized_detections