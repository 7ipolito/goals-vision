"use client";

import { useEffect, useRef, useState } from "react";

interface GingadoAnalyzerProps {
  onAnalysisComplete: (results: GingadoResults) => void;
  isActive: boolean;
}

interface GingadoResults {
  lateralMovements: number;
  coordinationScore: number;
  agilityScore: number;
  averageSpeed: number;
  totalTime: number;
}

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export function GingadoAnalyzer({
  onAnalysisComplete,
  isActive,
}: GingadoAnalyzerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [poseLandmarker, setPoseLandmarker] = useState<unknown>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Estados para análise
  const [movementData, setMovementData] = useState<
    Array<{
      timestamp: number;
      hipPosition: { x: number; y: number };
      shoulderPosition: { x: number; y: number };
    }>
  >([]);

  const [analysisResults, setAnalysisResults] = useState<GingadoResults | null>(
    null
  );

  // Limpar URL do vídeo quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  useEffect(() => {
    const loadMediaPipe = async () => {
      try {
        // Carregar MediaPipe via CDN
        // @ts-expect-error - MediaPipe tipos não disponíveis
        const vision = await window.FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        // @ts-expect-error - MediaPipe tipos não disponíveis
        const landmarker = await window.PoseLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          }
        );

        setPoseLandmarker(landmarker);
        setIsModelLoaded(true);
      } catch (error) {
        console.error("Erro ao carregar MediaPipe:", error);
      }
    };

    if (isActive && !poseLandmarker) {
      loadMediaPipe();
    }
  }, [isActive, poseLandmarker]);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setUploadedVideo(file);

      // Limpar URL anterior
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }

      // Criar nova URL
      const newVideoUrl = URL.createObjectURL(file);
      setVideoUrl(newVideoUrl);

      if (videoRef.current) {
        videoRef.current.src = newVideoUrl;
        videoRef.current.onloadeddata = () => {
          setIsVideoLoaded(true);
        };
      }
    }
  };

  const resetVideo = () => {
    setUploadedVideo(null);
    setIsVideoLoaded(false);
    setAnalysisResults(null);
    setMovementData([]);

    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl("");
    }

    if (videoRef.current) {
      videoRef.current.src = "";
    }
  };

  const startAnalysis = async () => {
    if (
      !poseLandmarker ||
      !videoRef.current ||
      !canvasRef.current ||
      !uploadedVideo
    )
      return;

    setIsAnalyzing(true);
    setMovementData([]);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Reiniciar vídeo do início
    video.currentTime = 0;
    await video.play();

    const analyze = () => {
      if (!isAnalyzing || video.ended) {
        setIsAnalyzing(false);
        calculateResults();
        return;
      }

      if (video.paused || video.seeking) {
        requestAnimationFrame(analyze);
        return;
      }

      try {
        // Detectar pose
        // @ts-expect-error - MediaPipe tipos não disponíveis
        const results = poseLandmarker.detectForVideo(video, performance.now());

        // Limpar canvas e desenhar vídeo
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];

          // Desenhar pose
          drawPose(ctx, landmarks, canvas.width, canvas.height);

          // Analisar movimento
          analyzeMovement(landmarks);
        }
      } catch (error) {
        console.error("Erro na análise:", error);
      }

      if (isAnalyzing) {
        requestAnimationFrame(analyze);
      }
    };

    analyze();
  };

  const drawPose = (
    ctx: CanvasRenderingContext2D,
    landmarks: PoseLandmark[],
    width: number,
    height: number
  ) => {
    // Conexões principais do corpo
    const connections = [
      [11, 12], // Ombros
      [11, 23], // Ombro esquerdo para quadril esquerdo
      [12, 24], // Ombro direito para quadril direito
      [23, 24], // Quadris
      [23, 25], // Quadril esquerdo para joelho esquerdo
      [24, 26], // Quadril direito para joelho direito
      [25, 27], // Joelho esquerdo para tornozelo esquerdo
      [26, 28], // Joelho direito para tornozelo direito
    ];

    // Desenhar conexões
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];

      if (startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x * width, startPoint.y * height);
        ctx.lineTo(endPoint.x * width, endPoint.y * height);
        ctx.stroke();
      }
    });

    // Desenhar pontos principais
    ctx.fillStyle = "#ff0000";
    [11, 12, 23, 24, 25, 26, 27, 28].forEach((index) => {
      const landmark = landmarks[index];
      if (landmark.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(landmark.x * width, landmark.y * height, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  const analyzeMovement = (landmarks: PoseLandmark[]) => {
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    if (
      leftHip.visibility > 0.5 &&
      rightHip.visibility > 0.5 &&
      leftShoulder.visibility > 0.5 &&
      rightShoulder.visibility > 0.5
    ) {
      const hipCenter = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2,
      };

      const shoulderCenter = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2,
      };

      setMovementData((prev) => [
        ...prev,
        {
          timestamp: Date.now(),
          hipPosition: hipCenter,
          shoulderPosition: shoulderCenter,
        },
      ]);
    }
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    calculateResults();
  };

  const calculateResults = () => {
    if (movementData.length < 10) return;

    let lateralMovements = 0;
    let totalSpeed = 0;
    let maxSpeed = 0;
    let coordinationSum = 0;

    // Analisar movimentos laterais
    for (let i = 1; i < movementData.length; i++) {
      const prev = movementData[i - 1];
      const curr = movementData[i];

      const lateralDistance = Math.abs(curr.hipPosition.x - prev.hipPosition.x);
      const timeDiff = (curr.timestamp - prev.timestamp) / 1000; // segundos

      if (lateralDistance > 0.05) {
        // Movimento lateral significativo
        lateralMovements++;
      }

      // Calcular velocidade
      const speed = lateralDistance / timeDiff;
      totalSpeed += speed;
      maxSpeed = Math.max(maxSpeed, speed);

      // Calcular coordenação (estabilidade dos ombros durante movimento do quadril)
      const shoulderStability =
        1 - Math.abs(curr.shoulderPosition.x - prev.shoulderPosition.x);
      coordinationSum += Math.max(0, shoulderStability);
    }

    const totalTime =
      (movementData[movementData.length - 1].timestamp -
        movementData[0].timestamp) /
      1000;
    const averageSpeed = totalSpeed / movementData.length;
    const coordinationScore = (coordinationSum / movementData.length) * 100;
    const agilityScore = Math.min(
      100,
      (lateralMovements / totalTime) * 10 + maxSpeed * 50
    );

    const results: GingadoResults = {
      lateralMovements,
      coordinationScore: Math.round(coordinationScore),
      agilityScore: Math.round(agilityScore),
      averageSpeed: Math.round(averageSpeed * 1000) / 1000,
      totalTime: Math.round(totalTime),
    };

    setAnalysisResults(results);
    onAnalysisComplete(results);
  };

  if (!isActive) return null;

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 text-center">
        🤸‍♂️ Análise de Gingado com IA
      </h3>

      {!isModelLoaded && (
        <div className="text-center text-gray-300 mb-4">
          Carregando modelo de IA...
        </div>
      )}

      <div className="relative mb-4">
        <video
          ref={videoRef}
          className="w-full h-64 bg-black rounded-lg"
          autoPlay
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute top-0 left-0 w-full h-64 rounded-lg"
        />
      </div>

      <div className="flex flex-col gap-4 mb-4">
        {!uploadedVideo ? (
          <div className="text-center">
            <label className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg cursor-pointer inline-block transition-colors">
              📹 Selecionar Vídeo
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                disabled={!isModelLoaded}
              />
            </label>
            <p className="text-gray-300 text-sm mt-2">
              Selecione um vídeo para analisar o gingado
            </p>
          </div>
        ) : (
          <div className="flex gap-2 justify-center">
            {!isAnalyzing ? (
              <>
                <button
                  onClick={startAnalysis}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  disabled={!isVideoLoaded}
                >
                  🚀 Analisar Vídeo
                </button>
                <button
                  onClick={resetVideo}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  🔄 Trocar Vídeo
                </button>
              </>
            ) : (
              <button
                onClick={stopAnalysis}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                ⏹️ Parar Análise
              </button>
            )}
          </div>
        )}
      </div>

      {analysisResults && (
        <div className="bg-black/20 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-2">Resultados:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-300">
              Movimentos Laterais:{" "}
              <span className="text-white font-bold">
                {analysisResults.lateralMovements}
              </span>
            </div>
            <div className="text-gray-300">
              Coordenação:{" "}
              <span className="text-white font-bold">
                {analysisResults.coordinationScore}%
              </span>
            </div>
            <div className="text-gray-300">
              Agilidade:{" "}
              <span className="text-white font-bold">
                {analysisResults.agilityScore}%
              </span>
            </div>
            <div className="text-gray-300">
              Tempo Total:{" "}
              <span className="text-white font-bold">
                {analysisResults.totalTime}s
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400 text-center">
        {uploadedVideo
          ? "Análise baseada no vídeo enviado com movimentos de gingado."
          : "Envie um vídeo com movimentos laterais, dribles e mudanças de direção para testar seu gingado!"}
      </div>
    </div>
  );
}
