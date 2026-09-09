import React, { useState, useRef, useEffect } from 'react';
import { Flex, Slider } from 'antd';
import './index.less';
import { ZYIcon } from "@/components";

interface AudioPlayerProps {
  src: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 格式化时间显示
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 播放/暂停切换
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 滑块变化处理
  const handleSliderChange = (value: number) => {
    if (!isPlaying) return; // 非播放状态不允许拖动
    setIsDragging(true);
    if (audioRef.current && duration > 0) {
      const newTime = (value / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(value);
    }
  };

  // 滑块拖拽结束
  const handleSliderAfterChange = () => {
    setIsDragging(false);
  };

  // 阻止滑块容器点击事件冒泡
  const handleSliderContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 阻止时间显示区域点击事件冒泡
  const handleTimeDisplayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 阻止音频控制区域点击事件冒泡
  const handleControlsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 刷新重试
  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);
    setDuration(0);
    
    if (audioRef.current) {
      audioRef.current.load();
    }
    
    // 刷新动画结束后
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // 音频事件监听
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setHasError(false);
    };

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    const handleLoadStart = () => {
      if (!isRefreshing) {
        setIsLoading(true);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [isDragging, isRefreshing]);

  return (
    <div className="custom-audio-player">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {hasError || (isRefreshing && isLoading) ? (
        // 加载失败状态
        <Flex className="audio-error" align="center" gap={4} onClick={handleControlsClick}>
          <ZYIcon 
            type="yinpinjiazaishibai" 
            className="error-icon"
          />
          <span className="error-text">音频加载失败，请刷新重试</span>
          <ZYIcon 
            type="shuaxin" 
            className={`refresh-icon ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
          />
        </Flex>
      ) : (
        // 正常播放状态
        <Flex className="audio-controls" align="center" gap={4} onClick={handleControlsClick}>
          {/* 播放/暂停按钮 */}
          <ZYIcon 
            type={ isPlaying ? "yinpinzanting" : "yinpinbofang"} 
            className="play-button"
            onClick={togglePlay}
            />
          
          {/* 进度滑块 */}
          <div className="slider-container" onClick={handleSliderContainerClick}>
            <Slider
              value={progress}
              onChange={handleSliderChange}
              onChangeComplete={handleSliderAfterChange}
              tooltip={{ formatter: null }}
              className="audio-slider"
              disabled={!isPlaying}
            />
          </div>
          
          <Flex onClick={handleTimeDisplayClick}>
            {/* 当前时间 */}
            <span className="time-display current-time">
              {formatTime(currentTime)}
            </span>
            {/* 总时长 */}
            <span className="time-display total-time">
              /{formatTime(duration)}
            </span>
          </Flex>
        </Flex>
      )}
    </div>
  );
};

export default AudioPlayer;