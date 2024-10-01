// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import './VideoChat.css';

// const VideoChat = ({ room, stream }) => {
//     const localVideoRef = useRef(null);
//     const remoteVideoRef = useRef(null);
//     const peerConnection = useRef(null);
//     const signalingSocket = useRef(null);
//     const iceCandidateQueue = useRef([]); // Queue for ICE candidates
//     const [isMuted, setIsMuted] = useState(false);
//     const [isCameraOff, setIsCameraOff] = useState(false);

//     // Include room.roomId in the dependency array
//     const sendMessage = useCallback((message) => {
//         if (signalingSocket.current && signalingSocket.current.readyState === WebSocket.OPEN) {
//             signalingSocket.current.send(JSON.stringify({ ...message, roomId: room.roomId }));
//         } else {
//             console.warn("WebSocket is not open. Current state:", signalingSocket.current?.readyState);
//         }
//     }, [room.roomId]); // Added room.roomId to dependencies

//     const handleSignalingData = useCallback((message) => {
//         switch (message.type) {
//             case 'answer':
//                 if (peerConnection.current) {
//                     console.log('Setting remote description with answer:', message.sdp);
//                     peerConnection.current.setRemoteDescription(new RTCSessionDescription(message.sdp))
//                         .then(() => {
//                             // Process queued ICE candidates
//                             iceCandidateQueue.current.forEach(candidate => {
//                                 peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
//                                     .catch(error => console.error('Error adding ICE candidate:', error));
//                             });
//                             iceCandidateQueue.current = []; // Clear the queue after processing
//                         })
//                         .catch(error => console.error('Error setting remote description:', error));
//                 }
//                 break;
//             case 'candidate':
//                 if (peerConnection.current) {
//                     if (peerConnection.current.remoteDescription) {
//                         // Add candidate immediately if remote description is set
//                         console.log('Adding ICE candidate:', message.candidate);
//                         peerConnection.current.addIceCandidate(new RTCIceCandidate(message.candidate))
//                             .catch(error => console.error('Error adding ICE candidate:', error));
//                     } else {
//                         // Queue the candidate until the remote description is set
//                         console.log('Queuing ICE candidate:', message.candidate);
//                         iceCandidateQueue.current.push(message.candidate);
//                     }
//                 }
//                 break;
//             default:
//                 console.error('Unknown message type:', message.type);
//         }
//     }, []); // Use an empty dependency array if handleSignalingData does not rely on external state

//     const setupWebRTC = useCallback(async () => {
//         try {
//             await new Promise(resolve => setTimeout(resolve, 1000));
//             signalingSocket.current = new WebSocket('ws://localhost:8080/signal');
    
//             signalingSocket.current.onopen = () => {
//                 console.log('WebSocket connection established');
//             };
    
//             signalingSocket.current.onmessage = (event) => {
//                 const message = JSON.parse(event.data);
//                 console.log('Received signaling message:', message);
//                 handleSignalingData(message);
//             };
    
//             signalingSocket.current.onerror = (error) => {
//                 console.error('WebSocket error:', error);
//             };
    
//             signalingSocket.current.onclose = () => {
//                 console.log('WebSocket connection closed');
//             };
    
//             if (!stream) {
//                 console.error('Stream is not available.');
//                 return;
//             }
    
//             // Create PeerConnection
//             peerConnection.current = new RTCPeerConnection({
//                 iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
//             });
    
//             // Set local video stream
//             localVideoRef.current.srcObject = stream;
    
//             // Add tracks from the stream to the peer connection
//             stream.getTracks().forEach((track) => {
//                 peerConnection.current.addTrack(track, stream);
//                 console.log('Added track:', track);
//             });
    
//             peerConnection.current.onicecandidate = (event) => {
//                 if (event.candidate) {
//                     console.log('Sending ICE candidate:', event.candidate);
//                     sendMessage({ type: 'candidate', candidate: event.candidate });
//                 }
//             };
    
//             peerConnection.current.ontrack = (event) => {
//                 console.log('Received remote track:', event.streams[0]);
//                 remoteVideoRef.current.srcObject = event.streams[0];
//             };
    
//             // Create and send offer only if no local description exists
//             if (!peerConnection.current.localDescription) {
//                 const offer = await peerConnection.current.createOffer();
//                 await peerConnection.current.setLocalDescription(offer);
//                 sendMessage({ type: 'offer', sdp: offer });
//             } else {
//                 console.warn('Local description already set, skipping offer creation.');
//             }
//         } catch (error) {
//             console.error('Error setting up WebRTC:', error);
//         }
//     }, [sendMessage, stream, handleSignalingData]);
    

//     const cleanupWebRTC = useCallback(() => {
//         if (peerConnection.current) {
//             peerConnection.current.getTracks().forEach(track => track.stop());
//             peerConnection.current.close();
//             peerConnection.current = null;
//         }
//         if (signalingSocket.current) {
//             signalingSocket.current.close();
//             signalingSocket.current = null;
//         }
//     }, []);

//     useEffect(() => {
//         if (stream) {
//             setupWebRTC();
//         }
//         return () => {
//             cleanupWebRTC();
//         };
//     }, [setupWebRTC, cleanupWebRTC, stream]);

//     const toggleMute = () => {
//         stream.getAudioTracks().forEach(track => {
//             track.enabled = !track.enabled;
//         });
//         setIsMuted(!isMuted);
//     };

//     const toggleCamera = () => {
//         stream.getVideoTracks().forEach(track => {
//             track.enabled = !track.enabled;
//         });
//         setIsCameraOff(!isCameraOff);
//     };

//     return (
//         <div className="video-chat-container">
//             <h2>Video Chat Room {room.roomId}</h2>
//             <h2>Room Code: {room.roomCode}</h2>
//             <div className="video-container">
//                 <video ref={localVideoRef} autoPlay muted className="local-video" />
//                 <video ref={remoteVideoRef} autoPlay muted className="remote-video" />
//             </div>
//             <div className="controls">
//                 <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
//                 <button onClick={toggleCamera}>{isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}</button>
//                 <button onClick={cleanupWebRTC}>End Call</button>
//             </div>
//         </div>
//     );
// };

// export default VideoChat;


// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import './VideoChat.css';

// const VideoChat = ({ room, stream }) => {
//     const localVideoRef = useRef(null);
//     const remoteVideoRef = useRef(null);
//     const peerConnection = useRef(null);
//     const signalingSocket = useRef(null);
//     const iceCandidateQueue = useRef([]); // Queue for ICE candidates
//     const [isMuted, setIsMuted] = useState(false);
//     const [isCameraOff, setIsCameraOff] = useState(false);

//     // Include room.roomId in the dependency array
//     const sendMessage = useCallback((message) => {
//         if (signalingSocket.current && signalingSocket.current.readyState === WebSocket.OPEN) {
//             signalingSocket.current.send(JSON.stringify({ ...message, roomId: room.roomId }));
//         } else {
//             console.warn("WebSocket is not open. Current state:", signalingSocket.current?.readyState);
//         }
//     }, [room.roomId]); // Added room.roomId to dependencies

//     const handleSignalingData = useCallback((message) => {
//         switch (message.type) {
//             case 'answer':
//                 if (peerConnection.current) {
//                     console.log('Setting remote description with answer:', message.sdp);
//                     peerConnection.current.setRemoteDescription(new RTCSessionDescription(message.sdp))
//                         .then(() => {
//                             // Process queued ICE candidates
//                             iceCandidateQueue.current.forEach(candidate => {
//                                 peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
//                                     .catch(error => console.error('Error adding ICE candidate:', error));
//                             });
//                             iceCandidateQueue.current = []; // Clear the queue after processing
//                         })
//                         .catch(error => console.error('Error setting remote description:', error));
//                 }
//                 break;
//             case 'candidate':
//                 if (peerConnection.current) {
//                     if (peerConnection.current.remoteDescription) {
//                         // Add candidate immediately if remote description is set
//                         console.log('Adding ICE candidate:', message.candidate);
//                         peerConnection.current.addIceCandidate(new RTCIceCandidate(message.candidate))
//                             .catch(error => console.error('Error adding ICE candidate:', error));
//                     } else {
//                         // Queue the candidate until the remote description is set
//                         console.log('Queuing ICE candidate:', message.candidate);
//                         iceCandidateQueue.current.push(message.candidate);
//                     }
//                 }
//                 break;
//             default:
//                 console.error('Unknown message type:', message.type);
//         }
//     }, []); // Use an empty dependency array if handleSignalingData does not rely on external state

//     const setupWebRTC = useCallback(async () => {
//         try {
//             await new Promise(resolve => setTimeout(resolve, 1000));
//             signalingSocket.current = new WebSocket('ws://localhost:8080/webrtc-signaling');
    
//             signalingSocket.current.onopen = () => {
//                 console.log('WebSocket connection established');
//             };
    
//             signalingSocket.current.onmessage = (event) => {
//                 const message = JSON.parse(event.data);
//                 console.log('Received signaling message:', message);
//                 handleSignalingData(message);
//             };
    
//             signalingSocket.current.onerror = (error) => {
//                 console.error('WebSocket error:', error);
//             };
    
//             signalingSocket.current.onclose = () => {
//                 console.log('WebSocket connection closed');
//             };
    
//             if (!stream) {
//                 console.error('Stream is not available.');
//                 return;
//             }
    
//             // Create PeerConnection
//             peerConnection.current = new RTCPeerConnection({
//                 iceServers: [{ urls: 'stun:stun.l.google.com:19302'
//                  }]
//             });
    
//             // Set local video stream
//             localVideoRef.current.srcObject = stream;
    
//             // Add tracks from the stream to the peer connection
//             stream.getTracks().forEach((track) => {
//                 peerConnection.current.addTrack(track, stream);
//                 console.log('Added track:', track);
//             });
    
//             peerConnection.current.onicecandidate = (event) => {
//                 if (event.candidate) {
//                     console.log('Sending ICE candidate:', event.candidate);
//                     sendMessage({ type: 'candidate', candidate: event.candidate });
//                 }
//             };
    
//             peerConnection.current.ontrack = (event) => {
//                 console.log('Received remote track:', event.streams[0]);
//                 remoteVideoRef.current.srcObject = event.streams[0];
//             };
    
//             // Create and send offer only if no local description exists
//             if (!peerConnection.current.localDescription) {
//                 const offer = await peerConnection.current.createOffer();
//                 await peerConnection.current.setLocalDescription(offer);
//                 sendMessage({ type: 'offer', sdp: offer });
//             } else {
//                 console.warn('Local description already set, skipping offer creation.');
//             }
//         } catch (error) {
//             console.error('Error setting up WebRTC:', error);
//         }
//     }, [sendMessage, stream, handleSignalingData]);
    

//     const cleanupWebRTC = useCallback(() => {
//         if (peerConnection.current) {
//             peerConnection.current.getTracks().forEach(track => track.stop());
//             peerConnection.current.close();
//             peerConnection.current = null;
//         }
//         if (signalingSocket.current) {
//             signalingSocket.current.close();
//             signalingSocket.current = null;
//         }
//     }, []);

//     useEffect(() => {
//         if (stream) {
//             setupWebRTC();
//         }
//         return () => {
//             cleanupWebRTC();
//         };
//     }, [setupWebRTC, cleanupWebRTC, stream]);

//     const toggleMute = () => {
//         stream.getAudioTracks().forEach(track => {
//             track.enabled = !track.enabled;
//         });
//         setIsMuted(!isMuted);
//     };

//     const toggleCamera = () => {
//         stream.getVideoTracks().forEach(track => {
//             track.enabled = !track.enabled;
//         });
//         setIsCameraOff(!isCameraOff);
//     };

//     return (
//         <div className="video-chat-container">
//             <h2>Video Chat Room {room.roomId}</h2>
//             <h2>Room Code: {room.roomCode}</h2>
//             <div className="video-container">
//                 <video ref={localVideoRef} autoPlay muted className="local-video" />
//                 <video ref={remoteVideoRef} autoPlay className="remote-video" />
//             </div>
//             <div className="controls">
//                 <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
//                 <button onClick={toggleCamera}>{isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}</button>
//                 <button onClick={cleanupWebRTC}>End Call</button>
//             </div>
//         </div>
//     );
// };

// export default VideoChat;



//Local p full functioning code

// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import './VideoChat.css';

// const VideoChat = ({ room, stream }) => {
//     const localVideoRef = useRef(null);
//     const remoteVideoRef = useRef(null);
//     const peerConnection = useRef(null);
//     const signalingSocket = useRef(null);
//     const iceCandidateQueue = useRef([]);
//     const [isMuted, setIsMuted] = useState(false);
//     const [isCameraOff, setIsCameraOff] = useState(false);

//     const sendMessage = useCallback((message) => {
//         if (signalingSocket.current && signalingSocket.current.readyState === WebSocket.OPEN) {
//             const messageWithRoomId = { ...message, roomId: room.roomId };
//             console.log('Sending message:', messageWithRoomId); // Log message before sending
//             signalingSocket.current.send(JSON.stringify(messageWithRoomId));
//         } else {
//             console.warn("WebSocket is not open. Current state:", signalingSocket.current?.readyState);
//         }
//     }, [room.roomId]);

//     const handleSignalingData = useCallback((message) => {
//         console.log('Handling signaling data:', message); // Log received signaling data
//         switch (message.type) {
//             case 'join':
//                 console.log('User joined the room:', message);
//                 break;
//             case 'offer':
//                 if (peerConnection.current) {
//                     console.log('Received offer:', message.sdp);
//                     peerConnection.current.setRemoteDescription(new RTCSessionDescription(message.sdp))
//                         .then(async () => {
//                             const answer = await peerConnection.current.createAnswer();
//                             await peerConnection.current.setLocalDescription(answer);
//                             sendMessage({ type: 'answer', sdp: answer });
//                         })
//                         .catch(error => console.error('Error setting remote description:', error));
//                 }
//                 break;
//             case 'answer':
//                 if (peerConnection.current) {
//                     console.log('Setting remote description with answer:', message.sdp);
//                     peerConnection.current.setRemoteDescription(new RTCSessionDescription(message.sdp))
//                         .then(() => {
//                             iceCandidateQueue.current.forEach(candidate => {
//                                 peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
//                                     .catch(error => console.error('Error adding ICE candidate:', error));
//                             });
//                             iceCandidateQueue.current = [];
//                         })
//                         .catch(error => console.error('Error setting remote description:', error));
//                 }
//                 break;
//             case 'candidate':
//                 if (peerConnection.current) {
//                     if (peerConnection.current.remoteDescription) {
//                         console.log('Adding ICE candidate:', message.candidate);
//                         peerConnection.current.addIceCandidate(new RTCIceCandidate(message.candidate))
//                             .catch(error => console.error('Error adding ICE candidate:', error));
//                     } else {
//                         console.log('Queuing ICE candidate:', message.candidate);
//                         iceCandidateQueue.current.push(message.candidate);
//                     }
//                 }
//                 break;
//             default:
//                 console.error('Unknown message type:', message.type);
//         }
//     }, [sendMessage]);

//     const setupWebRTC = useCallback(async () => {
//         try {
//             await new Promise(resolve => setTimeout(resolve, 1000));
//             signalingSocket.current = new WebSocket('ws://localhost:8080/webrtc-signaling');

//             signalingSocket.current.onopen = () => {
//                 console.log('WebSocket connection established');
//             };

//             signalingSocket.current.onmessage = (event) => {
//                 const message = JSON.parse(event.data);
//                 console.log('Received signaling message:', message);
//                 handleSignalingData(message);
//             };

//             signalingSocket.current.onerror = (error) => {
//                 console.error('WebSocket error:', error);
//             };

//             signalingSocket.current.onclose = () => {
//                 console.log('WebSocket connection closed');
//             };

//             if (!stream) {
//                 console.error('Stream is not available.');
//                 return;
//             }

//             peerConnection.current = new RTCPeerConnection({
//                 iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
//             });

//             localVideoRef.current.srcObject = stream;

//             stream.getTracks().forEach((track) => {
//                 peerConnection.current.addTrack(track, stream);
//                 console.log('Added track:', track);
//             });

//             peerConnection.current.onicecandidate = (event) => {
//                 if (event.candidate) {
//                     console.log('Sending ICE candidate:', event.candidate);
//                     sendMessage({ type: 'candidate', candidate: event.candidate });
//                 }
//             };

//             peerConnection.current.ontrack = (event) => {
//                 console.log('Received remote track:', event.streams[0]);
//                 remoteVideoRef.current.srcObject = event.streams[0];
//             };

//             if (!peerConnection.current.localDescription) {
//                 const offer = await peerConnection.current.createOffer();
//                 await peerConnection.current.setLocalDescription(offer);
//                 sendMessage({ type: 'offer', sdp: offer });
//             } else {
//                 console.warn('Local description already set, skipping offer creation.');
//             }
//         } catch (error) {
//             console.error('Error setting up WebRTC:', error);
//         }
//     }, [sendMessage, stream, handleSignalingData]);

//     const cleanupWebRTC = useCallback(() => {
//         if (peerConnection.current) {
//             // Use getSenders() to stop media tracks
//             peerConnection.current.getSenders().forEach(sender => {
//                 if (sender.track) {
//                     sender.track.stop(); // Stops the media stream
//                 }
//             });
//             peerConnection.current.close(); // Close the connection
//             peerConnection.current = null; // Clear the peer connection
//             console.log("Peer connection closed");
//         }

//         if (signalingSocket.current) {
//             signalingSocket.current.close(); // Close the signaling WebSocket
//             signalingSocket.current = null;
//             console.log("Signaling socket closed");
//         }

//         // Clear the video streams
//         if (remoteVideoRef.current) {
//             remoteVideoRef.current.srcObject = null;
//         }
//         if (localVideoRef.current) {
//             localVideoRef.current.srcObject = null;
//         }
//     }, []);

//     useEffect(() => {
//         if (stream) {
//             setupWebRTC();
//         }
//         return () => {
//             cleanupWebRTC();
//         };
//     }, [setupWebRTC, cleanupWebRTC, stream]);

//     const toggleMute = () => {
//         stream.getAudioTracks().forEach(track => {
//             track.enabled = !track.enabled;
//         });
//         setIsMuted(!isMuted);
//     };

//     const toggleCamera = () => {
//         stream.getVideoTracks().forEach(track => {
//             track.enabled = !track.enabled;
//         });
//         setIsCameraOff(!isCameraOff);
//     };

//     return (
//         <div className="video-chat-container">
//             <h2>Video Chat Room: {room.roomId}</h2>
//             <h2>Room Code: {room.roomCode}</h2>
//             <div className="video-container">
//                 <div>
//                     <h3>Local Stream</h3>
//                     <video ref={localVideoRef} autoPlay muted className="local-video" />
//                 </div>
//                 <div>
//                     <h3>Remote Stream</h3>
//                     <video ref={remoteVideoRef} autoPlay className="remote-video" />
//                 </div>
//             </div>
//             <div className="controls">
//                 <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
//                 <button onClick={toggleCamera}>{isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}</button>
//                 <button onClick={cleanupWebRTC}>End Call</button>
//             </div>
//         </div>
//     );
// };

// export default VideoChat;








//Server code

import React, { useEffect, useRef, useState, useCallback } from 'react';
import './VideoChat.css';

const VideoChat = ({ room, stream }) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const signalingSocket = useRef(null);
    const iceCandidateQueue = useRef([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);

    const sendMessage = useCallback((message) => {
        if (signalingSocket.current && signalingSocket.current.readyState === WebSocket.OPEN) {
            const messageWithRoomId = { ...message, roomId: room.roomId };
            console.log('Sending message:', messageWithRoomId);
            signalingSocket.current.send(JSON.stringify(messageWithRoomId));
        } else {
            console.warn("WebSocket is not open. Current state:", signalingSocket.current?.readyState);
        }
    }, [room.roomId]);

    const handleSignalingData = useCallback((message) => {
        console.log('Handling signaling data:', message);
        switch (message.type) {
            case 'join':
                console.log('User joined the room:', message);
                break;
            case 'offer':
                if (peerConnection.current) {
                    console.log('Received offer:', message.sdp);
                    peerConnection.current.setRemoteDescription(new RTCSessionDescription(message.sdp))
                        .then(async () => {
                            const answer = await peerConnection.current.createAnswer();
                            await peerConnection.current.setLocalDescription(answer);
                            sendMessage({ type: 'answer', sdp: answer });
                        })
                        .catch(error => console.error('Error setting remote description:', error));
                }
                break;
            case 'answer':
                if (peerConnection.current) {
                    console.log('Setting remote description with answer:', message.sdp);
                    peerConnection.current.setRemoteDescription(new RTCSessionDescription(message.sdp))
                        .then(() => {
                            iceCandidateQueue.current.forEach(candidate => {
                                peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
                                    .catch(error => console.error('Error adding ICE candidate:', error));
                            });
                            iceCandidateQueue.current = [];
                        })
                        .catch(error => console.error('Error setting remote description:', error));
                }
                break;
            case 'candidate':
                if (peerConnection.current) {
                    if (peerConnection.current.remoteDescription) {
                        console.log('Adding ICE candidate:', message.candidate);
                        peerConnection.current.addIceCandidate(new RTCIceCandidate(message.candidate))
                            .catch(error => console.error('Error adding ICE candidate:', error));
                    } else {
                        console.log('Queuing ICE candidate:', message.candidate);
                        iceCandidateQueue.current.push(message.candidate);
                    }
                }
                break;
            default:
                console.error('Unknown message type:', message.type);
        }
    }, [sendMessage]);

    const setupWebRTC = useCallback(async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Replace the WebSocket URL with the provided URL
            signalingSocket.current = new WebSocket('ws://video-call-application-5f1u.onrender.com/webrtc-signaling');

            signalingSocket.current.onopen = () => {
                console.log('WebSocket connection established');
            };

            signalingSocket.current.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log('Received signaling message:', message);
                handleSignalingData(message);
            };

            signalingSocket.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            signalingSocket.current.onclose = () => {
                console.log('WebSocket connection closed');
            };

            if (!stream) {
                console.error('Stream is not available.');
                return;
            }

            peerConnection.current = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            localVideoRef.current.srcObject = stream;

            stream.getTracks().forEach((track) => {
                peerConnection.current.addTrack(track, stream);
                console.log('Added track:', track);
            });

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('Sending ICE candidate:', event.candidate);
                    sendMessage({ type: 'candidate', candidate: event.candidate });
                }
            };

            peerConnection.current.ontrack = (event) => {
                console.log('Received remote track:', event.streams[0]);
                remoteVideoRef.current.srcObject = event.streams[0];
            };

            if (!peerConnection.current.localDescription) {
                const offer = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(offer);
                sendMessage({ type: 'offer', sdp: offer });
            } else {
                console.warn('Local description already set, skipping offer creation.');
            }
        } catch (error) {
            console.error('Error setting up WebRTC:', error);
        }
    }, [sendMessage, stream, handleSignalingData]);

    const cleanupWebRTC = useCallback(() => {
        if (peerConnection.current) {
            peerConnection.current.getSenders().forEach(sender => {
                if (sender.track) {
                    sender.track.stop();
                }
            });
            peerConnection.current.close();
            peerConnection.current = null;
            console.log("Peer connection closed");
        }

        if (signalingSocket.current) {
            signalingSocket.current.close();
            signalingSocket.current = null;
            console.log("Signaling socket closed");
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
    }, []);

    useEffect(() => {
        if (stream) {
            setupWebRTC();
        }
        return () => {
            cleanupWebRTC();
        };
    }, [setupWebRTC, cleanupWebRTC, stream]);

    const toggleMute = () => {
        stream.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsMuted(!isMuted);
    };

    const toggleCamera = () => {
        stream.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsCameraOff(!isCameraOff);
    };

    return (
        <div className="video-chat-container">
            <h2>Video Chat Room: {room.roomId}</h2>
            <h2>Room Code: {room.roomCode}</h2>
            <div className="video-container">
                <div>
                    <h3>Local Stream</h3>
                    <video ref={localVideoRef} autoPlay muted className="local-video" />
                </div>
                <div>
                    <h3>Remote Stream</h3>
                    <video ref={remoteVideoRef} autoPlay className="remote-video" />
                </div>
            </div>
            <div className="controls">
                <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
                <button onClick={toggleCamera}>{isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}</button>
                <button onClick={cleanupWebRTC}>End Call</button>
            </div>
        </div>
    );
};

export default VideoChat;
