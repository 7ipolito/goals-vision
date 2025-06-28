import os
import sys
import cv2
import pickle
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import time
import requests
from urllib.parse import urlparse, parse_qs
import tempfile
import tkinter as tk
from tkinter import ttk, messagebox
from PIL import Image, ImageTk
import threading

sys.path.append('../')
from utils import read_video, save_video
from trackers import Tracker
from team_assigner import TeamAssigner
from player_ball_assigner import PlayerBallAssigner
from camera_movement_estimator import CameraMovementEstimator
from view_transformer import ViewTransformer
from speed_and_distance_estimator import SpeedAndDistance_Estimator

def download_video_from_url(url, temp_dir="temp_videos"):
    """
    Baixa um vídeo de uma URL e salva na pasta temporária.
    Suporta URLs diretas de vídeo e algumas plataformas populares.
    """
    print(f"🌐 Baixando vídeo da URL: {url}")
    
    # Criar diretório temporário se não existir
    os.makedirs(temp_dir, exist_ok=True)
    
    # Gerar nome único para o arquivo
    timestamp = int(time.time())
    
    try:
        # Verificar se é uma URL válida
        parsed_url = urlparse(url)
        if not parsed_url.scheme:
            raise ValueError("URL inválida - deve começar com http:// ou https://")
        
        print("🔍 Verificando URL...")
        
        # Primeiro, fazer uma requisição HEAD para obter informações do arquivo
        try:
            head_response = requests.head(url, timeout=10, allow_redirects=True)
            final_url = head_response.url  # URL final após redirecionamentos
            content_type = head_response.headers.get('content-type', '').lower()
            content_length = head_response.headers.get('content-length')
            
            print(f"📋 Tipo de conteúdo: {content_type}")
            if content_length:
                size_mb = int(content_length) / 1024 / 1024
                print(f"📏 Tamanho: {size_mb:.1f} MB")
        except:
            print("⚠️  Não foi possível obter informações do cabeçalho, tentando download direto...")
            final_url = url
            content_type = ""
            content_length = None
        
        # Determinar extensão do arquivo baseada na URL ou content-type
        file_extension = ".mp4"  # padrão
        
        if content_type:
            if 'mp4' in content_type or 'video/mp4' in content_type:
                file_extension = ".mp4"
            elif 'avi' in content_type or 'video/avi' in content_type:
                file_extension = ".avi"
            elif 'mov' in content_type or 'video/mov' in content_type:
                file_extension = ".mov"
            elif 'webm' in content_type or 'video/webm' in content_type:
                file_extension = ".webm"
        else:
            # Tentar determinar pela URL
            url_lower = final_url.lower()
            if '.mp4' in url_lower:
                file_extension = ".mp4"
            elif '.avi' in url_lower:
                file_extension = ".avi"
            elif '.mov' in url_lower:
                file_extension = ".mov"
            elif '.webm' in url_lower:
                file_extension = ".webm"
            elif '.mkv' in url_lower:
                file_extension = ".mkv"
        
        temp_filename = f"downloaded_video_{timestamp}{file_extension}"
        temp_path = os.path.join(temp_dir, temp_filename)
        
        print("📥 Iniciando download...")
        
        # Fazer o download com streaming para arquivos grandes
        response = requests.get(final_url, stream=True, timeout=60)
        response.raise_for_status()
        
        # Obter tamanho total se disponível
        total_size = int(response.headers.get('content-length', 0))
        downloaded_size = 0
        
        with open(temp_path, 'wb') as f:
            print("💾 Salvando arquivo...")
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    downloaded_size += len(chunk)
                    
                    # Mostrar progresso se soubermos o tamanho total
                    if total_size > 0:
                        progress = (downloaded_size / total_size) * 100
                        print(f"\r   Progresso: {progress:.1f}% ({downloaded_size / 1024 / 1024:.1f}MB / {total_size / 1024 / 1024:.1f}MB)", end='')
                    else:
                        print(f"\r   Baixado: {downloaded_size / 1024 / 1024:.1f}MB", end='')
        
        print(f"\n✅ Download concluído!")
        print(f"📁 Arquivo salvo em: {temp_path}")
        print(f"📊 Tamanho total: {downloaded_size / 1024 / 1024:.1f}MB")
        
        # Verificação mais robusta do arquivo de vídeo
        print("🔍 Validando arquivo de vídeo...")
        
        # Primeiro, verificar se o arquivo tem tamanho razoável
        if downloaded_size < 1024:  # Menos de 1KB
            os.remove(temp_path)
            raise ValueError("Arquivo muito pequeno - provavelmente não é um vídeo")
        
        # Tentar abrir com OpenCV
        cap = cv2.VideoCapture(temp_path)
        if not cap.isOpened():
            cap.release()
            
            # Se falhou, tentar converter com ffmpeg (se disponível)
            print("⚠️  OpenCV não conseguiu abrir o arquivo diretamente")
            print("🔄 Tentando conversão para MP4...")
            
            converted_path = os.path.join(temp_dir, f"converted_{timestamp}.mp4")
            
            # Tentar conversão com ffmpeg
            try:
                import subprocess
                result = subprocess.run([
                    'ffmpeg', '-i', temp_path, '-c:v', 'libx264', '-c:a', 'aac', 
                    '-y', converted_path
                ], capture_output=True, text=True, timeout=300)
                
                if result.returncode == 0:
                    print("✅ Conversão bem-sucedida!")
                    os.remove(temp_path)  # Remover arquivo original
                    temp_path = converted_path
                    
                    # Tentar abrir novamente
                    cap = cv2.VideoCapture(temp_path)
                    if not cap.isOpened():
                        cap.release()
                        os.remove(temp_path)
                        raise ValueError("Arquivo não é um vídeo válido mesmo após conversão")
                else:
                    os.remove(temp_path)
                    raise ValueError("Falha na conversão do vídeo")
                    
            except (subprocess.TimeoutExpired, FileNotFoundError):
                os.remove(temp_path)
                raise ValueError("FFmpeg não disponível ou conversão falhou")
            except Exception:
                os.remove(temp_path)
                raise ValueError("Erro durante a conversão do vídeo")
        
        # Verificar propriedades do vídeo
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        cap.release()
        
        if frame_count == 0 or fps == 0:
            os.remove(temp_path)
            raise ValueError("O vídeo não contém frames válidos ou tem FPS inválido")
        
        if width == 0 or height == 0:
            os.remove(temp_path)
            raise ValueError("Dimensões do vídeo são inválidas")
        
        duration = frame_count / fps if fps > 0 else 0
        
        print(f"🎬 Vídeo válido detectado:")
        print(f"   • Resolução: {width}x{height}")
        print(f"   • FPS: {fps:.1f}")
        print(f"   • Frames: {frame_count}")
        print(f"   • Duração: {duration:.1f} segundos")
        
        return temp_path
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro no download: {e}")
        print("💡 Dicas:")
        print("   • Verifique se a URL está correta")
        print("   • Certifique-se de que a URL aponta diretamente para um arquivo de vídeo")
        print("   • Tente um link direto (não de plataformas como YouTube)")
        return None
    except ValueError as e:
        print(f"❌ Erro de validação: {e}")
        print("💡 Dicas para URLs de vídeo válidas:")
        print("   • Use links diretos que terminam em .mp4, .avi, .mov, etc.")
        print("   • Evite links de páginas web ou plataformas de streaming")
        print("   • Teste a URL no navegador primeiro")
        return None
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return None

def get_video_source():
    """
    Permite ao usuário escolher entre arquivo local ou URL para download.
    """
    print("\n" + "="*60)
    print("SELECIONAR FONTE DO VÍDEO")
    print("="*60)
    print("Escolha como você quer fornecer o vídeo:")
    print("1️⃣  Arquivo local (já salvo no computador)")
    print("2️⃣  URL (baixar da internet)")
    print("="*60)
    
    while True:
        choice = input("Digite sua escolha (1 ou 2): ").strip()
        
        if choice == "1":
            print("\n📁 ARQUIVO LOCAL SELECIONADO")
            print("Vídeos disponíveis na pasta input_videos:")
            
            # Listar vídeos disponíveis
            video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv']
            available_videos = []
            
            if os.path.exists('input_videos'):
                for file in os.listdir('input_videos'):
                    if any(file.lower().endswith(ext) for ext in video_extensions):
                        available_videos.append(file)
            
            if available_videos:
                print("Vídeos encontrados:")
                for i, video in enumerate(available_videos, 1):
                    print(f"  {i}. {video}")
                
                print(f"  {len(available_videos) + 1}. Digitar caminho personalizado")
                
                try:
                    video_choice = int(input(f"Escolha o vídeo (1-{len(available_videos) + 1}): ")) - 1
                    
                    if 0 <= video_choice < len(available_videos):
                        video_path = f"input_videos/{available_videos[video_choice]}"
                    elif video_choice == len(available_videos):
                        video_path = input("Digite o caminho completo do vídeo: ").strip()
                    else:
                        print("❌ Escolha inválida!")
                        continue
                        
                except ValueError:
                    print("❌ Por favor, digite um número válido!")
                    continue
            else:
                print("❌ Nenhum vídeo encontrado na pasta input_videos/")
                video_path = input("Digite o caminho completo do vídeo: ").strip()
            
            # Verificar se o arquivo existe
            if os.path.exists(video_path):
                print(f"✅ Arquivo encontrado: {video_path}")
                return video_path
            else:
                print(f"❌ Arquivo não encontrado: {video_path}")
                print("Tente novamente...")
                continue
                
        elif choice == "2":
            print("\n🌐 DOWNLOAD POR URL SELECIONADO")
            print("Exemplos de URLs suportadas:")
            print("• URL direta de vídeo: https://example.com/video.mp4")
            print("• Links de arquivos do Google Drive, Dropbox, etc.")
            print("• Outros links diretos de vídeo")
            print("\n⚠️  Nota: URLs de YouTube, Instagram, etc. não são suportadas")
            print("Para essas plataformas, use ferramentas como yt-dlp primeiro")
            
            while True:
                print("\nOpções:")
                print("1️⃣  Digitar URL do vídeo")
                print("2️⃣  Ver exemplos de URLs que funcionam")
                print("3️⃣  Voltar ao menu principal")
                
                url_choice = input("Escolha uma opção (1-3): ").strip()
                
                if url_choice == "1":
                    url = input("\nDigite a URL do vídeo: ").strip()
                    
                    if not url:
                        print("❌ URL não pode estar vazia!")
                        continue
                        
                    if not (url.startswith('http://') or url.startswith('https://')):
                        print("❌ URL deve começar com http:// ou https://")
                        continue
                    
                    # Validar URL antes do download
                    if validate_url_before_download(url):
                        # Tentar baixar o vídeo
                        video_path = download_video_from_url(url)
                        
                        if video_path:
                            print(f"✅ Vídeo baixado com sucesso!")
                            return video_path
                        else:
                            print("❌ Falha no download.")
                            retry = input("Tentar outra URL? (s/n): ").strip().lower()
                            if retry != 's':
                                break
                            continue
                    else:
                        print("❌ URL não passou na validação.")
                        continue
                        
                elif url_choice == "2":
                    suggest_example_urls()
                    continue
                    
                elif url_choice == "3":
                    break
                    
                else:
                    print("❌ Escolha inválida! Digite 1, 2 ou 3.")
                    continue
            
            # Se chegou aqui, usuário escolheu voltar ou falhou no download
            continue
                
        else:
            print("❌ Escolha inválida! Digite 1 ou 2.")
            continue

def draw_player_stats(frames, tracks, chosen_players):
    """Add comprehensive player statistics overlay to video frames for multiple players"""
    output_frames = []
    
    highlight_colors = [
        (0, 255, 255),    # Cyan
        (255, 0, 255),    # Magenta
        (0, 255, 0),      # Green
        (255, 165, 0),    # Orange
        (255, 0, 0),      # Red
        (128, 0, 128),    # Purple
        (0, 128, 255),    # Light Blue
        (255, 255, 0)     # Bright Yellow
    ]
    
    for frame_num, frame in enumerate(frames):
        frame_copy = frame.copy()
        
        # Calculate overlay dimensions based on number of players
        players_in_frame = []
        for player_id in chosen_players:
            if (frame_num < len(tracks['players']) and 
                player_id in tracks['players'][frame_num]):
                players_in_frame.append(player_id)
        
        if players_in_frame:
            # Dynamic overlay size based on number of players
            overlay_height = 60 + (len(players_in_frame) * 25)
            overlay_width = 500
            
            # Draw main overlay
            overlay = frame_copy.copy()
            cv2.rectangle(overlay, (10, 10), (overlay_width, overlay_height), (0, 0, 0), -1)
            alpha = 0.8
            cv2.addWeighted(overlay, alpha, frame_copy, 1 - alpha, 0, frame_copy)
            
            # Header
            cv2.putText(frame_copy, f"🏃 JOGADORES ANALISADOS ({len(players_in_frame)}/{len(chosen_players)})", 
                       (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            
            # Individual player stats
            y_offset = 55
            for i, player_id in enumerate(players_in_frame):
                player_data = tracks['players'][frame_num][player_id]
                color = highlight_colors[chosen_players.index(player_id) % len(highlight_colors)]
                
                # Get current stats
                current_speed = player_data.get('speed', 0)
                current_distance = player_data.get('distance', 0)
                has_ball = player_data.get('has_ball', False)
                team = player_data.get('team', 'N/A')
                
                # Player info line
                ball_icon = "⚽" if has_ball else "  "
                speed_icon = "🚀" if current_speed > 20 else "🏃" if current_speed > 10 else "🚶"
                
                player_text = f"{ball_icon}J{player_id} T{team}: {current_speed:.1f}km/h {current_distance:.0f}m {speed_icon}"
                cv2.putText(frame_copy, player_text, 
                           (25, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                y_offset += 25
            
            # Progress and time info
            progress = (frame_num + 1) / len(frames) * 100
            time_elapsed = frame_num / 24  # Assuming 24 FPS
            cv2.putText(frame_copy, f"Tempo: {time_elapsed:.1f}s | Frame: {frame_num+1}/{len(frames)}", 
                       (20, overlay_height - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (150, 150, 150), 1)
        
        else:
            # No players visible - show warning
            overlay = frame_copy.copy()
            cv2.rectangle(overlay, (10, 10), (400, 80), (0, 0, 100), -1)
            alpha = 0.7
            cv2.addWeighted(overlay, alpha, frame_copy, 1 - alpha, 0, frame_copy)
            
            cv2.putText(frame_copy, f"⚠️  NENHUM JOGADOR SELECIONADO DETECTADO", 
                       (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
            cv2.putText(frame_copy, f"Jogadores: {chosen_players}", 
                       (20, 55), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)
        
        output_frames.append(frame_copy)
    
    return output_frames


def analyze_video_and_estimate_time(video_path):
    """Analyze video properties and estimate processing time"""
    import cv2
    import time
    
    print("🔍 ANALISANDO VÍDEO...")
    print("="*50)
    
    # Get video properties
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total_frames / fps if fps > 0 else 0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()
    
    print(f"📹 Propriedades do vídeo:")
    print(f"   • Arquivo: {video_path}")
    print(f"   • Total de frames: {total_frames:,}")
    print(f"   • FPS: {fps:.1f}")
    print(f"   • Duração: {duration:.1f} segundos")
    print(f"   • Resolução: {width}x{height}")
    
    # Calculate processing time estimates
    # Based on observed performance: ~660ms per frame for YOLO + ~90% additional for other steps
    yolo_time_per_frame = 0.66  # seconds
    total_multiplier = 1.9  # Total processing is ~90% more than just YOLO
    estimated_total_seconds = total_frames * yolo_time_per_frame * total_multiplier
    
    estimated_minutes = estimated_total_seconds / 60
    
    print(f"\n⏱️  ESTIMATIVA DE TEMPO:")
    print(f"   • Detecção YOLO: ~{(total_frames * yolo_time_per_frame / 60):.1f} minutos")
    print(f"   • Processamento total: ~{estimated_minutes:.1f} minutos")
    print(f"   • Tempo estimado: {estimated_total_seconds/60:.0f}min {estimated_total_seconds%60:.0f}s")
    
    # Performance tips
    print(f"\n💡 DICAS DE PERFORMANCE:")
    if total_frames > 500:
        print(f"   ⚠️  Vídeo longo ({total_frames} frames) - processamento demorado")
        print(f"   💡 Considere usar um vídeo menor para teste")
    else:
        print(f"   ✅ Vídeo de tamanho adequado para análise")
    
    if estimated_minutes > 10:
        print(f"   ⏰ Processamento vai demorar mais de 10 minutos")
        print(f"   💡 Sugestão: teste com vídeo menor primeiro")
    
    print("="*50)
    
    # Ask user confirmation
    while True:
        response = input("🤔 Deseja continuar com o processamento? (s/n): ").lower().strip()
        if response in ['s', 'sim', 'y', 'yes']:
            return True, total_frames, estimated_total_seconds
        elif response in ['n', 'nao', 'não', 'no']:
            print("❌ Processamento cancelado pelo usuário.")
            return False, total_frames, estimated_total_seconds
        else:
            print("Por favor, responda 's' para sim ou 'n' para não.")

def show_progress(current_step, total_steps, step_name, start_time=None):
    """Show processing progress"""
    progress = (current_step / total_steps) * 100
    bar_length = 30
    filled_length = int(bar_length * current_step // total_steps)
    bar = '█' * filled_length + '░' * (bar_length - filled_length)
    
    elapsed_time = time.time() - start_time if start_time else 0
    
    print(f"\r🔄 {step_name}: [{bar}] {progress:.1f}% ({current_step}/{total_steps})", end="")
    if elapsed_time > 0:
        eta = (elapsed_time / current_step) * (total_steps - current_step)
        print(f" | ETA: {eta/60:.1f}min", end="")
    print("", flush=True)

def suggest_example_urls():
    """
    Exibe URLs de exemplo que geralmente funcionam bem para download de vídeos.
    """
    print("\n" + "="*60)
    print("EXEMPLOS DE URLs QUE FUNCIONAM BEM")
    print("="*60)
    print("✅ URLs diretas de arquivos:")
    print("   • https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4")
    print("   • https://file-examples.com/storage/fe.../file_example_MP4_480_1_5MG.mp4")
    print("   • Links do Google Drive (compartilhamento público)")
    print("   • Links do Dropbox (terminados em ?dl=1)")
    print()
    print("❌ URLs que NÃO funcionam:")
    print("   • YouTube: https://youtube.com/watch?v=...")
    print("   • Instagram: https://instagram.com/...")
    print("   • TikTok: https://tiktok.com/...")
    print("   • Facebook: https://facebook.com/...")
    print()
    print("💡 DICA: Para baixar de plataformas sociais, use:")
    print("   • yt-dlp (YouTube, Instagram, etc.)")
    print("   • 4K Video Downloader")
    print("   • Sites como savefrom.net, y2mate.com")
    print("="*60)

def validate_url_before_download(url):
    """
    Faz uma validação básica da URL antes de tentar o download completo.
    """
    try:
        print("🔍 Validando URL...")
        
        # Fazer requisição HEAD para verificar se a URL é acessível
        response = requests.head(url, timeout=10, allow_redirects=True)
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '').lower()
            content_length = response.headers.get('content-length')
            
            print(f"✅ URL acessível (Status: {response.status_code})")
            print(f"📋 Tipo de conteúdo: {content_type}")
            
            if content_length:
                size_mb = int(content_length) / 1024 / 1024
                print(f"📏 Tamanho estimado: {size_mb:.1f} MB")
                
                if size_mb > 500:
                    print("⚠️  Arquivo muito grande (>500MB). O download pode demorar.")
                    confirm = input("Deseja continuar? (s/n): ").strip().lower()
                    if confirm != 's':
                        return False
            
            # Verificar se parece ser um vídeo
            is_video = any(video_type in content_type for video_type in 
                          ['video/', 'mp4', 'avi', 'mov', 'webm', 'mkv'])
            
            if is_video:
                print("🎬 Parece ser um arquivo de vídeo!")
                return True
            else:
                print(f"⚠️  Aviso: Não parece ser um vídeo (tipo: {content_type})")
                print("Você ainda pode tentar fazer o download.")
                confirm = input("Continuar mesmo assim? (s/n): ").strip().lower()
                return confirm == 's'
                
        else:
            print(f"❌ URL não acessível (Status: {response.status_code})")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"⚠️  Não foi possível validar a URL: {e}")
        print("Você ainda pode tentar fazer o download.")
        confirm = input("Tentar download mesmo assim? (s/n): ").strip().lower()
        return confirm == 's'
    except Exception as e:
        print(f"⚠️  Erro na validação: {e}")
        return False

def main():
    import time
    
    video_path = get_video_source()
    
    # Analyze video and get user confirmation
    should_continue, total_frames, estimated_time = analyze_video_and_estimate_time(video_path)
    
    if not should_continue:
        return
    
    print(f"\n🚀 INICIANDO PROCESSAMENTO...")
    overall_start_time = time.time()
    
    # Read Video
    print("📁 Carregando vídeo...")
    video_frames = read_video(video_path)

    # Initialize Tracker
    print("🤖 Inicializando modelo YOLO...")
    tracker = Tracker('models/best.pt')

    # Get video properties for ID stabilization configuration
    cap = cv2.VideoCapture(video_path)
    video_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    video_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    video_fps = cap.get(cv2.CAP_PROP_FPS)
    cap.release()
    
    # Configure ID stabilization based on video properties
    tracker.configure_stabilization(video_width=video_width, video_height=video_height, fps=video_fps)

    print("👁️  Detectando e rastreando objetos...")
    step_start = time.time()
    tracks = tracker.get_object_tracks(video_frames,
                                       read_from_stub=False,
                                       stub_path='stubs/track_stubs.pkl')
    print(f"✅ Detecção concluída em {time.time() - step_start:.1f}s")
    
    # Show ID stabilization statistics
    if hasattr(tracker, 'player_history'):
        stable_players = len([p for p in tracker.player_history.values() if p['last_seen'] >= len(video_frames) - 30])
        total_mappings = len(tracker.id_mapping)
        print(f"🔄 Sistema de estabilização de IDs ativo:")
        print(f"   • Jogadores com tracking estável: {stable_players}")
        print(f"   • Total de IDs mapeados: {total_mappings}")
        if stable_players > 0:
            print(f"   ✅ IDs mais consistentes - menos mudanças durante o vídeo!")
        else:
            print(f"   ⚠️  Aguardando estabilização do tracking...")
    else:
        print("⚠️  Sistema de estabilização não inicializado")
    
    # Get object positions 
    print("📍 Calculando posições dos objetos...")
    tracker.add_position_to_tracks(tracks)

    # camera movement estimator
    print("📹 Estimando movimento da câmera...")
    step_start = time.time()
    camera_movement_estimator = CameraMovementEstimator(video_frames[0])
    camera_movement_per_frame = camera_movement_estimator.get_camera_movement(video_frames,
                                                                                read_from_stub=False,
                                                                                stub_path='stubs/camera_movement_stub.pkl')
    camera_movement_estimator.add_adjust_positions_to_tracks(tracks,camera_movement_per_frame)
    print(f"✅ Movimento da câmera calculado em {time.time() - step_start:.1f}s")

    # View Trasnformer
    print("🗺️  Transformando perspectiva...")
    view_transformer = ViewTransformer()
    view_transformer.add_transformed_position_to_tracks(tracks)

    # Interpolate Ball Positions
    print("⚽ Interpolando posições da bola...")
    tracks["ball"] = tracker.interpolate_ball_positions(tracks["ball"])

    # Speed and distance estimator
    print("🏃 Calculando velocidades e distâncias...")
    speed_and_distance_estimator = SpeedAndDistance_Estimator()
    speed_and_distance_estimator.add_speed_and_distance_to_tracks(tracks)

    # Show available players and let user choose one
    available_players = set()
    for frame_players in tracks['players']:
        available_players.update(frame_players.keys())
    
    # Create a preview image with player IDs
    # Use a frame from the middle of the video where tracking is more stable
    middle_frame_idx = min(len(tracks['players']) // 3, 50)  # Frame around 1/3 of video or frame 50
    
    # Find the best frame around the middle with most players
    best_frame_idx = middle_frame_idx
    max_players = 0
    search_range = range(max(0, middle_frame_idx - 5), min(len(tracks['players']), middle_frame_idx + 6))
    
    for idx in search_range:
        if len(tracks['players'][idx]) > max_players:
            max_players = len(tracks['players'][idx])
            best_frame_idx = idx
    
    preview_frame = video_frames[best_frame_idx].copy()
    
    print(f"🎯 Usando frame {best_frame_idx + 1} para preview (onde tracking está mais estável)")
    
    # Draw all players with their IDs on the preview frame
    for player_id, player_data in tracks['players'][best_frame_idx].items():
        bbox = player_data['bbox']
        
        # Draw bounding box
        cv2.rectangle(preview_frame, 
                     (int(bbox[0]), int(bbox[1])), 
                     (int(bbox[2]), int(bbox[3])), 
                     (0, 255, 0), 2)
        
        # Draw player ID with background
        label = f"Jogador {player_id}"
        label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)[0]
        cv2.rectangle(preview_frame,
                     (int(bbox[0]), int(bbox[1] - label_size[1] - 10)),
                     (int(bbox[0] + label_size[0] + 10), int(bbox[1])),
                     (0, 255, 0), -1)
        cv2.putText(preview_frame, label,
                   (int(bbox[0] + 5), int(bbox[1] - 5)),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
    
    # Save multiple preview images for consistency
    cv2.imwrite('output_videos/players_preview.jpg', preview_frame)
    
    # Create additional preview from different moments
    additional_frames = [
        len(tracks['players']) // 6,  # Early frame
        len(tracks['players']) // 2,  # Middle frame
        min(len(tracks['players']) - 10, len(tracks['players']) * 2 // 3)  # Later frame
    ]
    
    for i, frame_idx in enumerate(additional_frames):
        if frame_idx < len(tracks['players']) and len(tracks['players'][frame_idx]) > 0:
            add_frame = video_frames[frame_idx].copy()
            
            # Draw players on additional frame
            for player_id, player_data in tracks['players'][frame_idx].items():
                bbox = player_data['bbox']
                cv2.rectangle(add_frame, 
                             (int(bbox[0]), int(bbox[1])), 
                             (int(bbox[2]), int(bbox[3])), 
                             (255, 0, 0), 2)  # Blue boxes for variety
                
                label = f"ID:{player_id}"
                cv2.rectangle(add_frame,
                             (int(bbox[0]), int(bbox[1] - 25)),
                             (int(bbox[0] + 60), int(bbox[1])),
                             (255, 0, 0), -1)
                cv2.putText(add_frame, label,
                           (int(bbox[0] + 5), int(bbox[1] - 5)),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            cv2.imwrite(f'output_videos/players_preview_{i+2}.jpg', add_frame)
    
    print("\n" + "="*60)
    print("IMAGENS DE PREVIEW SALVAS!")
    print("="*60)
    print("Múltiplas imagens com jogadores detectados foram salvas:")
    print("📁 output_videos/players_preview.jpg (frame principal)")
    print("📁 output_videos/players_preview_2.jpg (início do vídeo)")
    print("📁 output_videos/players_preview_3.jpg (meio do vídeo)")
    print("📁 output_videos/players_preview_4.jpg (final do vídeo)")
    print("\nAbra essas imagens para comparar os IDs dos jogadores.")
    print("\n⚠️  IMPORTANTE: Os IDs podem mudar durante o tracking!")
    print("Se um jogador aparece como ID 12 na preview mas como 7 no vídeo,")
    print("isso é normal. Use as imagens para identificar VISUALMENTE o jogador")
    print("e depois teste com diferentes IDs se necessário.")
    print("="*60)
    
    # Analyze player ID stability
    player_frame_count = {}
    for frame_players in tracks['players']:
        for player_id in frame_players.keys():
            player_frame_count[player_id] = player_frame_count.get(player_id, 0) + 1
    
    # Sort players by how often they appear (most stable IDs first)
    stable_players = sorted(player_frame_count.items(), key=lambda x: x[1], reverse=True)
    
    print("\nJOGADORES DETECTADOS NO VÍDEO (ordenados por estabilidade):")
    print("-" * 55)
    for player_id, frame_count in stable_players:
        percentage = (frame_count / len(tracks['players'])) * 100
        print(f"🏃 Jogador ID: {player_id:2d} | Aparece em {frame_count:3d}/{len(tracks['players'])} frames ({percentage:5.1f}%)")
    
    print(f"\n💡 DICA: IDs com maior % são mais estáveis e confiáveis!")
    
    # Detect and report ID changes/inconsistencies
    def detect_id_changes(tracks):
        """Analyze tracking consistency and report potential issues"""
        frame_transitions = []
        
        for frame_num in range(1, len(tracks['players'])):
            prev_frame = tracks['players'][frame_num - 1]
            curr_frame = tracks['players'][frame_num]
            
            # Players that disappeared
            disappeared = set(prev_frame.keys()) - set(curr_frame.keys())
            # New players that appeared
            appeared = set(curr_frame.keys()) - set(prev_frame.keys())
            
            if disappeared or appeared:
                frame_transitions.append({
                    'frame': frame_num,
                    'disappeared': list(disappeared),
                    'appeared': list(appeared)
                })
        
        return frame_transitions
    
    id_changes = detect_id_changes(tracks)
    if len(id_changes) > 0:
        critical_changes = [c for c in id_changes if len(c['disappeared']) > 0 and len(c['appeared']) > 0]
        print(f"\n🔄 ANÁLISE DE CONSISTÊNCIA DO TRACKING:")
        print(f"   • Total de mudanças detectadas: {len(id_changes)}")
        print(f"   • Mudanças críticas (ID swap): {len(critical_changes)}")
        
        if len(critical_changes) > 5:
            print(f"   ⚠️  ATENÇÃO: Muitas mudanças de ID detectadas!")
            print(f"   💡 Se o jogador mudar de número no vídeo, isso é normal")
            print(f"   💡 O sistema de estabilização está tentando manter consistência")
        elif len(critical_changes) > 0:
            print(f"   ✅ Tracking razoável com algumas mudanças esperadas")
        else:
            print(f"   ✅ Tracking muito estável - poucos IDs perdidos")
        
        # Show some examples of changes
        if len(critical_changes) > 0:
            print(f"\n   📝 Exemplos de mudanças (primeiros 3):")
            for i, change in enumerate(critical_changes[:3]):
                frame_time = change['frame'] / 24
                print(f"      Frame {change['frame']} ({frame_time:.1f}s): IDs {change['disappeared']} → {change['appeared']}")
    else:
        print(f"\n✅ TRACKING PERFEITO: Nenhuma mudança de ID detectada!")
    
    print("\n" + "="*60)
    chosen_players = []
    while not chosen_players:
        try:
            player_input = input("Digite o(s) número(s) do(s) jogador(es) para analisar (separados por vírgula): ")
            # Parse multiple players
            player_numbers = [int(x.strip()) for x in player_input.split(',')]
            
            # Validate all players exist
            invalid_players = [p for p in player_numbers if p not in available_players]
            if invalid_players:
                print(f"❌ Jogador(es) {invalid_players} não encontrado(s). Escolha dos jogadores listados acima.")
                continue
                
            chosen_players = player_numbers
            print(f"✅ Selecionados: {len(chosen_players)} jogador(es) - {chosen_players}")
            
            # Give helpful tips about ID stability
            if len(id_changes) > 5:
                print(f"\n💡 DICAS PARA ESTE VÍDEO:")
                print(f"   • Se seu jogador 'desaparecer', tente IDs próximos")
                print(f"   • O sistema tenta manter consistência, mas pode haver mudanças")
                print(f"   • Use as imagens de preview para identificar visualmente")
                print(f"   • IDs com maior % de aparição são mais confiáveis")
            
        except ValueError:
            print("❌ Por favor, digite números válidos separados por vírgula (ex: 7,12,15).")

    # Assign Player Teams
    print("👕 Analisando cores dos times...")
    step_start = time.time()
    team_assigner = TeamAssigner()
    team_assigner.assign_team_color(video_frames[0], 
                                    tracks['players'][0])
    
    for frame_num, player_track in enumerate(tracks['players']):
        for player_id, track in player_track.items():
            team = team_assigner.get_player_team(video_frames[frame_num],   
                                                 track['bbox'],
                                                 player_id)
            tracks['players'][frame_num][player_id]['team'] = team 
            tracks['players'][frame_num][player_id]['team_color'] = team_assigner.team_colors[team]
    print(f"✅ Times identificados em {time.time() - step_start:.1f}s")
    
    # Assign Ball Aquisition
    print("⚽ Analisando posse de bola...")
    player_assigner =PlayerBallAssigner()
    team_ball_control= []
    for frame_num, player_track in enumerate(tracks['players']):
        ball_bbox = tracks['ball'][frame_num][1]['bbox']
        assigned_player = player_assigner.assign_ball_to_player(player_track, ball_bbox)

        if assigned_player != -1:
            tracks['players'][frame_num][assigned_player]['has_ball'] = True
            team_ball_control.append(tracks['players'][frame_num][assigned_player]['team'])
        else:
            # If no team_ball_control history exists, default to team 1
            if len(team_ball_control) == 0:
                team_ball_control.append(1)
            else:
                team_ball_control.append(team_ball_control[-1])
    team_ball_control= np.array(team_ball_control)


    # Draw output 
    print("🎨 Gerando vídeo final...")
    step_start = time.time()
    
    ## Draw object Tracks
    output_video_frames = tracker.draw_annotations(video_frames, tracks,team_ball_control, highlighted_players=chosen_players)

    ## Draw Camera movement
    output_video_frames = camera_movement_estimator.draw_camera_movement(output_video_frames,camera_movement_per_frame)

    ## Draw Speed and Distance
    speed_and_distance_estimator.draw_speed_and_distance(output_video_frames,tracks)
    
    ## Add player statistics overlay
    output_video_frames = draw_player_stats(output_video_frames, tracks, chosen_players)
    print(f"✅ Vídeo renderizado em {time.time() - step_start:.1f}s")

    # Comprehensive player analysis
    def analyze_player_comprehensive(tracks, player_id):
        stats = {
            'total_distance': 0,
            'max_speed': 0,
            'avg_speed': 0,
            'min_speed': float('inf'),
            'frames_present': 0,
            'frames_with_ball': 0,
            'ball_possession_time': 0,
            'team': None,
            'speed_samples': [],
            'position_history': [],
            'high_speed_moments': 0,  # Sprints > 20 km/h
            'time_in_each_third': {'def': 0, 'mid': 0, 'att': 0},
            'distance_per_period': []
        }
        
        frame_rate = 24  # FPS
        video_length = len(tracks['players'])
        
        for frame_num, frame_players in enumerate(tracks['players']):
            if player_id in frame_players:
                player_data = frame_players[player_id]
                stats['frames_present'] += 1
                
                # Distance and speed
                if 'distance' in player_data:
                    stats['total_distance'] = max(stats['total_distance'], player_data['distance'])
                
                if 'speed' in player_data:
                    speed = player_data['speed']
                    stats['speed_samples'].append(speed)
                    stats['max_speed'] = max(stats['max_speed'], speed)
                    stats['min_speed'] = min(stats['min_speed'], speed)
                    
                    if speed > 20:  # Sprint threshold
                        stats['high_speed_moments'] += 1
                
                # Team info
                if 'team' in player_data:
                    stats['team'] = player_data['team']
                
                # Ball possession
                if player_data.get('has_ball', False):
                    stats['frames_with_ball'] += 1
                
                # Position tracking for field coverage
                if 'position_transformed' in player_data and player_data['position_transformed']:
                    stats['position_history'].append(player_data['position_transformed'])
        
        # Calculate derived stats
        if stats['speed_samples']:
            stats['avg_speed'] = sum(stats['speed_samples']) / len(stats['speed_samples'])
        if stats['min_speed'] == float('inf'):
            stats['min_speed'] = 0
            
        stats['ball_possession_time'] = (stats['frames_with_ball'] / frame_rate) if frame_rate > 0 else 0
        stats['time_on_field'] = (stats['frames_present'] / frame_rate) if frame_rate > 0 else 0
        stats['presence_percentage'] = (stats['frames_present'] / video_length * 100) if video_length > 0 else 0
        stats['ball_possession_percentage'] = (stats['frames_with_ball'] / stats['frames_present'] * 100) if stats['frames_present'] > 0 else 0
        stats['sprint_percentage'] = (stats['high_speed_moments'] / stats['frames_present'] * 100) if stats['frames_present'] > 0 else 0
        
        # Calculate distance in different periods (quarters)
        quarter_size = video_length // 4
        for i in range(4):
            start_frame = i * quarter_size
            end_frame = min((i + 1) * quarter_size, video_length)
            quarter_distance = 0
            
            for frame_num in range(start_frame, end_frame):
                if (frame_num < len(tracks['players']) and 
                    player_id in tracks['players'][frame_num] and 
                    'distance' in tracks['players'][frame_num][player_id]):
                    quarter_distance = tracks['players'][frame_num][player_id]['distance']
            
            # Distance in this quarter is the difference
            prev_distance = stats['distance_per_period'][-1] if stats['distance_per_period'] else 0
            stats['distance_per_period'].append(max(0, quarter_distance - prev_distance))
        
        return stats
    
    # Analyze all chosen players
    all_player_stats = {}
    all_highlight_metrics = {}
    
    for player_id in chosen_players:
        all_player_stats[player_id] = analyze_player_comprehensive(tracks, player_id)
    
    # Calculate highlight-specific metrics for 30-second videos
    def calculate_highlight_metrics(tracks, player_id):
        highlights = {
            'peak_speed': 0,
            'explosive_moments': [],  # Sudden speed increases
            'ball_impact_moments': [],  # High-value ball touches
            'sprint_bursts': 0,  # Number of sprint sequences
            'acceleration_peaks': [],  # Best accelerations
            'efficiency_with_ball': 0,  # Distance covered with ball vs without
            'critical_speed_moments': [],  # Top 5 fastest moments
            'consistency_score': 0,  # How consistent the performance is
            'highlight_rating': 0  # Overall highlight quality (1-10)
        }
        
        speeds = []
        with_ball_distances = []
        without_ball_distances = []
        
        for frame_num, frame_players in enumerate(tracks['players']):
            if player_id in frame_players:
                player_data = frame_players[player_id]
                speed = player_data.get('speed', 0)
                has_ball = player_data.get('has_ball', False)
                distance = player_data.get('distance', 0)
                
                speeds.append((frame_num, speed))
                
                # Track distances with/without ball
                if has_ball:
                    with_ball_distances.append(distance)
                    # Mark as ball impact moment if speed > 15 km/h
                    if speed > 15:
                        highlights['ball_impact_moments'].append({
                            'frame': frame_num,
                            'speed': speed,
                            'timestamp': frame_num / 24
                        })
                else:
                    without_ball_distances.append(distance)
                
                # Detect explosive moments (acceleration)
                if len(speeds) > 5:
                    prev_speed = speeds[-6][1]
                    acceleration = speed - prev_speed
                    if acceleration > 8:  # Significant acceleration
                        highlights['explosive_moments'].append({
                            'frame': frame_num,
                            'acceleration': acceleration,
                            'final_speed': speed,
                            'timestamp': frame_num / 24
                        })
                
                # Count sprint bursts
                if speed > 22:  # Elite sprint speed
                    highlights['sprint_bursts'] += 1
        
        # Calculate top speed moments
        speeds_sorted = sorted(speeds, key=lambda x: x[1], reverse=True)
        highlights['critical_speed_moments'] = speeds_sorted[:5]
        highlights['peak_speed'] = speeds_sorted[0][1] if speeds_sorted else 0
        
        # Calculate efficiency with ball
        avg_with_ball = sum(with_ball_distances) / len(with_ball_distances) if with_ball_distances else 0
        avg_without_ball = sum(without_ball_distances) / len(without_ball_distances) if without_ball_distances else 0
        if avg_without_ball > 0:
            highlights['efficiency_with_ball'] = (avg_with_ball / avg_without_ball) * 100
        
        # Calculate highlight rating (1-10)
        rating = 0
        rating += min(3, highlights['peak_speed'] / 10)  # Max 3 points for speed
        rating += min(2, len(highlights['ball_impact_moments']) / 3)  # Max 2 points for ball moments
        rating += min(2, len(highlights['explosive_moments']) / 2)  # Max 2 points for explosions
        rating += min(2, highlights['sprint_bursts'] / 20)  # Max 2 points for sprints
        rating += min(1, highlights['efficiency_with_ball'] / 100)  # Max 1 point for efficiency
        highlights['highlight_rating'] = min(10, rating)
        
        return highlights
    
    # Calculate highlight metrics for all players
    for player_id in chosen_players:
        all_highlight_metrics[player_id] = calculate_highlight_metrics(tracks, player_id)
    
    # Display comprehensive comparative analysis
    print("\n" + "="*80)
    print("🎬 ANÁLISE COMPARATIVA DE HIGHLIGHTS - RELATÓRIO PARA SCOUTS")
    print("="*80)
    print(f"👥 Jogadores Analisados: {len(chosen_players)} - {chosen_players}")
    
    # Summary comparison table
    print("\n📊 RESUMO COMPARATIVO:")
    print("-" * 80)
    print(f"{'Jogador':<8} {'Time':<5} {'Vel.Max':<8} {'Nota':<5} {'Sprints':<8} {'Com Bola':<9}")
    print("-" * 80)
    
    for player_id in chosen_players:
        stats = all_player_stats[player_id]
        highlights = all_highlight_metrics[player_id]
        print(f"{player_id:<8} {stats['team']:<5} {highlights['peak_speed']:<8.1f} {highlights['highlight_rating']:<5.1f} "
              f"{highlights['sprint_bursts']:<8} {len(highlights['ball_impact_moments']):<9}")
    
    # Individual detailed analysis for each player
    for i, player_id in enumerate(chosen_players):
        player_stats = all_player_stats[player_id]
        highlight_metrics = all_highlight_metrics[player_id]
        
        print(f"\n" + "="*80)
        print(f"🏃 JOGADOR {player_id} - ANÁLISE DETALHADA")
        print("="*80)
        print(f"👕 Time: {player_stats['team']} | ⭐ Nota: {highlight_metrics['highlight_rating']:.1f}/10")
        
        print(f"\n🚀 VELOCIDADE E EXPLOSIVIDADE:")
        print(f"   • Velocidade de pico: {highlight_metrics['peak_speed']:.1f} km/h")
        print(f"   • Velocidade média: {player_stats['avg_speed']:.1f} km/h")
        print(f"   • Momentos explosivos: {len(highlight_metrics['explosive_moments'])}")
        print(f"   • Sprints (>22 km/h): {highlight_metrics['sprint_bursts']} frames")
        
        print(f"\n⚽ IMPACTO COM A BOLA:")
        print(f"   • Toques na bola: {player_stats['frames_with_ball']} frames")
        print(f"   • Momentos alta velocidade: {len(highlight_metrics['ball_impact_moments'])}")
        print(f"   • Eficiência: {highlight_metrics['efficiency_with_ball']:.1f}%")
        print(f"   • Tempo com bola: {player_stats['ball_possession_time']:.1f}s")
        
        print(f"\n📏 MOVIMENTO:")
        print(f"   • Distância total: {player_stats['total_distance']:.1f}m")
        print(f"   • Presença no vídeo: {player_stats['presence_percentage']:.1f}%")
        
        # Top moments for this player
        if highlight_metrics['critical_speed_moments']:
            print(f"\n🏆 TOP 3 VELOCIDADES:")
            for j, (frame, speed) in enumerate(highlight_metrics['critical_speed_moments'][:3]):
                timestamp = frame / 24
                print(f"   {j+1}. {speed:.1f} km/h aos {timestamp:.1f}s")
    
    # Comparative rankings
    print(f"\n" + "="*80)
    print("🏆 RANKINGS COMPARATIVOS")
    print("="*80)
    
    # Speed ranking
    speed_ranking = sorted(chosen_players, key=lambda p: all_highlight_metrics[p]['peak_speed'], reverse=True)
    print(f"\n🚀 RANKING VELOCIDADE MÁXIMA:")
    for i, player_id in enumerate(speed_ranking):
        speed = all_highlight_metrics[player_id]['peak_speed']
        print(f"   {i+1}. Jogador {player_id}: {speed:.1f} km/h")
    
    # Overall rating ranking
    rating_ranking = sorted(chosen_players, key=lambda p: all_highlight_metrics[p]['highlight_rating'], reverse=True)
    print(f"\n⭐ RANKING NOTA GERAL:")
    for i, player_id in enumerate(rating_ranking):
        rating = all_highlight_metrics[player_id]['highlight_rating']
        print(f"   {i+1}. Jogador {player_id}: {rating:.1f}/10")
    
    # Ball impact ranking
    ball_ranking = sorted(chosen_players, key=lambda p: len(all_highlight_metrics[p]['ball_impact_moments']), reverse=True)
    print(f"\n⚽ RANKING IMPACTO COM BOLA:")
    for i, player_id in enumerate(ball_ranking):
        moments = len(all_highlight_metrics[player_id]['ball_impact_moments'])
        print(f"   {i+1}. Jogador {player_id}: {moments} momentos")
    
    # Distance ranking
    distance_ranking = sorted(chosen_players, key=lambda p: all_player_stats[p]['total_distance'], reverse=True)
    print(f"\n📏 RANKING DISTÂNCIA PERCORRIDA:")
    for i, player_id in enumerate(distance_ranking):
        distance = all_player_stats[player_id]['total_distance']
        print(f"   {i+1}. Jogador {player_id}: {distance:.1f}m")
    
    print("="*80)
    
    # Final summary
    print(f"\n💡 RESUMO DA ANÁLISE:")
    print(f"   • Total de jogadores analisados: {len(chosen_players)}")
    print(f"   • Melhor velocidade: Jogador {speed_ranking[0]} ({all_highlight_metrics[speed_ranking[0]]['peak_speed']:.1f} km/h)")
    print(f"   • Melhor nota geral: Jogador {rating_ranking[0]} ({all_highlight_metrics[rating_ranking[0]]['highlight_rating']:.1f}/10)")
    print(f"   • Mais ativo com bola: Jogador {ball_ranking[0]} ({len(all_highlight_metrics[ball_ranking[0]]['ball_impact_moments'])} momentos)")
    
    print(f"\n🎥 Vídeo gerado com {len(chosen_players)} jogador(es) destacado(s) em cores diferentes!")
    print("="*80)

    # Save video
    print("💾 Salvando vídeo...")
    save_video(output_video_frames, 'output_videos/output_video.avi')
    
    # Calculate total time and show summary
    total_elapsed = time.time() - overall_start_time
    estimated_accuracy = ((estimated_time - total_elapsed) / estimated_time) * 100
    
    print("\n" + "="*70)
    print("🎉 PROCESSAMENTO CONCLUÍDO!")
    print("="*70)
    print(f"⏱️  Tempo estimado: {estimated_time/60:.1f} minutos")
    print(f"⏱️  Tempo real: {total_elapsed/60:.1f} minutos")
    print(f"🎯 Precisão da estimativa: {100-abs(estimated_accuracy):.1f}%")
    print(f"📁 Vídeo salvo em: output_videos/output_video.avi")
    print(f"🏃 Jogadores {chosen_players} destacados com cores diferentes")
    print(f"📊 Relatório comparativo completo exibido acima")
    
    if abs(estimated_accuracy) < 20:
        print("✅ Estimativa muito precisa!")
    elif abs(estimated_accuracy) < 40:
        print("⚠️  Estimativa razoável")
    else:
        print("❌ Estimativa imprecisa - performance variou")
    
    print("\n💡 NOVA FUNCIONALIDADE:")
    print("   • Agora você pode selecionar múltiplos jogadores!")
    print("   • Use vírgulas para separar: ex: 7,12,15")
    print("   • Cada jogador terá uma cor diferente no vídeo")
    print("   • Análise comparativa completa entre jogadores")
    
    print("="*70)

if __name__ == '__main__':
    main()