from sklearn.cluster import KMeans

class TeamAssigner:
    def __init__(self):
        self.team_colors = {}
        self.player_team_dict = {}
    
    def get_clustering_model(self,image):
        # Reshape the image to 2D array
        image_2d = image.reshape(-1,3)

        # Check if we have enough samples for clustering
        if len(image_2d) == 0:
            return None

        # Preform K-means with 2 clusters
        kmeans = KMeans(n_clusters=2, init="k-means++",n_init=1)
        kmeans.fit(image_2d)

        return kmeans

    def get_player_color(self,frame,bbox):
        image = frame[int(bbox[1]):int(bbox[3]),int(bbox[0]):int(bbox[2])]

        # Check if the cropped image is valid
        if image.shape[0] == 0 or image.shape[1] == 0:
            return None

        top_half_image = image[0:int(image.shape[0]/2),:]

        # Check if top half has valid dimensions
        if top_half_image.shape[0] == 0 or top_half_image.shape[1] == 0:
            return None

        # Get Clustering model
        kmeans = self.get_clustering_model(top_half_image)

        # Check if clustering was successful
        if kmeans is None:
            return None

        # Get the cluster labels forr each pixel
        labels = kmeans.labels_

        # Reshape the labels to the image shape
        clustered_image = labels.reshape(top_half_image.shape[0],top_half_image.shape[1])

        # Get the player cluster
        corner_clusters = [clustered_image[0,0],clustered_image[0,-1],clustered_image[-1,0],clustered_image[-1,-1]]
        non_player_cluster = max(set(corner_clusters),key=corner_clusters.count)
        player_cluster = 1 - non_player_cluster

        player_color = kmeans.cluster_centers_[player_cluster]

        return player_color

    def assign_team_color(self,frame, player_detections):
        player_colors = []
        for _, player_detection in player_detections.items():
            bbox = player_detection["bbox"]
            player_color = self.get_player_color(frame,bbox)
            if player_color is not None:  # Only add valid colors
                player_colors.append(player_color)
        
        # Check if we have enough valid player colors for clustering
        if len(player_colors) < 2:
            # Set default team colors if we don't have enough samples
            self.team_colors[1] = [255, 0, 0]  # Red
            self.team_colors[2] = [0, 0, 255]  # Blue
            self.kmeans = None
            return
        
        kmeans = KMeans(n_clusters=2, init="k-means++",n_init=10)
        kmeans.fit(player_colors)

        self.kmeans = kmeans

        self.team_colors[1] = kmeans.cluster_centers_[0]
        self.team_colors[2] = kmeans.cluster_centers_[1]

    def get_player_team(self,frame,player_bbox,player_id):
        if player_id in self.player_team_dict:
            return self.player_team_dict[player_id]

        player_color = self.get_player_color(frame,player_bbox)

        # If we don't have valid color or clustering model, assign default team
        if player_color is None or self.kmeans is None:
            team_id = 1  # Default team
        else:
            team_id = self.kmeans.predict(player_color.reshape(1,-1))[0]
            team_id += 1

        if player_id == 91:
            team_id = 1

        self.player_team_dict[player_id] = team_id

        return team_id