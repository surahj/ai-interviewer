// Media device utilities for handling microphone and camera permissions

export interface MediaDeviceInfo {
  deviceId: string;
  kind: MediaDeviceKind;
  label: string;
  groupId: string;
}

export interface PermissionStatus {
  microphone: 'granted' | 'denied' | 'prompt';
  camera: 'granted' | 'denied' | 'prompt';
}

// Check if media devices API is supported
export const isMediaDevicesSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 
         !!navigator.mediaDevices && 
         !!navigator.mediaDevices.getUserMedia;
};

// Get available media devices
export const getAvailableDevices = async (): Promise<MediaDeviceInfo[]> => {
  if (!isMediaDevicesSupported()) {
    throw new Error('Media devices API not supported');
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.map(device => ({
      deviceId: device.deviceId,
      kind: device.kind,
      label: device.label,
      groupId: device.groupId
    }));
  } catch (error) {
    console.error('Error enumerating devices:', error);
    throw error;
  }
};

// Check permission status (Note: This is limited by browser security)
export const checkPermissionStatus = async (): Promise<PermissionStatus> => {
  const status: PermissionStatus = {
    microphone: 'prompt',
    camera: 'prompt'
  };

  try {
    // Try to get permissions by requesting them
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });

    // If we get here, permissions were granted
    status.microphone = 'granted';
    status.camera = 'granted';

    // Stop the stream immediately
    stream.getTracks().forEach(track => track.stop());
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        status.microphone = 'denied';
        status.camera = 'denied';
      }
    }
  }

  return status;
};

// Test microphone specifically
export const testMicrophone = async (): Promise<{ success: boolean; error?: string }> => {
  if (!isMediaDevicesSupported()) {
    return { success: false, error: 'Media devices API not supported' };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    // Test if we actually got audio tracks
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      throw new Error('No audio tracks found');
    }

    // Test audio levels briefly
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    
    // Stop the stream after testing
    stream.getTracks().forEach(track => track.stop());
    audioContext.close();

    return { success: true };
  } catch (error) {
    console.error('Microphone test failed:', error);
    
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'Microphone permission denied' };
      } else if (error.name === 'NotFoundError') {
        return { success: false, error: 'No microphone found' };
      } else if (error.name === 'NotReadableError') {
        return { success: false, error: 'Microphone is already in use' };
      }
    }
    
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Test camera specifically
export const testCamera = async (): Promise<{ success: boolean; error?: string }> => {
  if (!isMediaDevicesSupported()) {
    return { success: false, error: 'Media devices API not supported' };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user"
      }
    });

    // Test if we actually got video tracks
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) {
      throw new Error('No video tracks found');
    }

    // Check video capabilities
    const videoTrack = videoTracks[0];
    const capabilities = videoTrack.getCapabilities();
    if (!capabilities) {
      throw new Error('Cannot access video capabilities');
    }

    // Stop the stream after testing
    stream.getTracks().forEach(track => track.stop());

    return { success: true };
  } catch (error) {
    console.error('Camera test failed:', error);
    
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'Camera permission denied' };
      } else if (error.name === 'NotFoundError') {
        return { success: false, error: 'No camera found' };
      } else if (error.name === 'NotReadableError') {
        return { success: false, error: 'Camera is already in use' };
      }
    }
    
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Request both microphone and camera permissions
export const requestMediaPermissions = async (): Promise<{
  microphone: boolean;
  camera: boolean;
  error?: string;
}> => {
  if (!isMediaDevicesSupported()) {
    return { microphone: false, camera: false, error: 'Media devices API not supported' };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user"
      }
    });

    // Check what we got
    const audioTracks = stream.getAudioTracks();
    const videoTracks = stream.getVideoTracks();

    // Stop the stream
    stream.getTracks().forEach(track => track.stop());

    return {
      microphone: audioTracks.length > 0,
      camera: videoTracks.length > 0
    };
  } catch (error) {
    console.error('Permission request failed:', error);
    
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        return { microphone: false, camera: false, error: 'Permission denied' };
      } else if (error.name === 'NotFoundError') {
        return { microphone: false, camera: false, error: 'No devices found' };
      } else if (error.name === 'NotReadableError') {
        return { microphone: false, camera: false, error: 'Devices are already in use' };
      }
    }
    
    return { 
      microphone: false, 
      camera: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Get browser-specific permission instructions
export const getPermissionInstructions = (): string => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome')) {
    return 'Click the camera/microphone icon in the address bar and select "Allow"';
  } else if (userAgent.includes('Firefox')) {
    return 'Click "Allow" when prompted, or go to the shield icon in the address bar';
  } else if (userAgent.includes('Safari')) {
    return 'Go to Safari > Preferences > Websites > Camera/Microphone and allow access';
  } else if (userAgent.includes('Edge')) {
    return 'Click the camera/microphone icon in the address bar and select "Allow"';
  } else {
    return 'Look for camera/microphone permission prompts in your browser';
  }
};

// Check if we're in a secure context (required for media devices)
export const isSecureContext = (): boolean => {
  return typeof window !== 'undefined' && window.isSecureContext;
};
