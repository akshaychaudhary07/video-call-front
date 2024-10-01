// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import './RoomForm.css';

// const RoomForm = ({ onRoomCreated }) => {
//     const [roomId, setRoomId] = useState('');
//     const [roomCode, setRoomCode] = useState('');
//     const [participantId, setParticipantId] = useState('');
//     const [message, setMessage] = useState('');
//     const [loading, setLoading] = useState(false);
//     const localVideoRef = useRef(null);
//     const [stream, setStream] = useState(null);

//     // Sync room information across tabs
//     useEffect(() => {
//         const handleStorageChange = (event) => {
//             if (event.key === 'roomInfo') {
//                 const { roomId, roomCode, participantId } = JSON.parse(event.newValue);
//                 setRoomId(roomId);
//                 setRoomCode(roomCode);
//                 setParticipantId(participantId);
//                 // Optionally, you could setup the local stream here if desired
//             }
//         };

//         window.addEventListener('storage', handleStorageChange);

//         return () => {
//             window.removeEventListener('storage', handleStorageChange);
//         };
//     }, []);

//     const handleMediaErrors = (error) => {
//         switch (error.name) {
//             case 'NotAllowedError':
//                 setMessage('Permissions denied for camera/microphone.');
//                 break;
//             case 'NotFoundError':
//                 setMessage('No camera or microphone found.');
//                 break;
//             case 'NotReadableError':
//                 setMessage('Camera or microphone is already in use. Please check other applications.');
//                 break;
//             default:
//                 setMessage('Error accessing media devices: ' + error.message);
//                 break;
//         }
//         console.error('Media error:', error);
//     };

//     const setupLocalStream = async () => {
//         try {
//             if (stream) {
//                 stream.getTracks().forEach(track => track.stop());
//             }

//             const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//             if (localVideoRef.current) {
//                 localVideoRef.current.srcObject = mediaStream;
//             }
//             setStream(mediaStream);
//             return mediaStream;
//         } catch (error) {
//             handleMediaErrors(error);
//             return null;
//         }
//     };

//     const createRoom = async () => {
//         setLoading(true);
//         setMessage('');
//         try {
//             const response = await axios.post('http://localhost:8080/api/room/create');
//             setRoomId(response.data.roomId);
//             setRoomCode(response.data.roomCode);
//             const mediaStream = await setupLocalStream();
//             if (mediaStream) {
//                 setMessage('Room created successfully!');
//                 const roomInfo = { roomId: response.data.roomId, roomCode: response.data.roomCode, participantId };
//                 localStorage.setItem('roomInfo', JSON.stringify(roomInfo)); // Store in local storage
//                 onRoomCreated({ roomId: response.data.roomId, roomCode: response.data.roomCode, stream: mediaStream });
//             } else {
//                 setMessage('Failed to access media devices. Please check your permissions.');
//             }
//         } catch (error) {
//             console.error('Error during room creation:', error);
//             setMessage('Error creating room: ' + (error.response?.data || error.message));
//         } finally {
//             setLoading(false);
//         }
//     };

//     const joinRoom = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage('');
//         try {
//             const response = await axios.post('http://localhost:8080/api/room/join', null, {
//                 params: { roomId, roomCode, participantId },
//             });
            
//             if (response.data === 'Joined successfully') {
//                 const mediaStream = await setupLocalStream();
//                 if (mediaStream) {
//                     setMessage('Joined room successfully!');
//                     const roomInfo = { roomId, roomCode, participantId };
//                     localStorage.setItem('roomInfo', JSON.stringify(roomInfo));
//                     onRoomCreated({ roomId, roomCode, stream: mediaStream, participantId });
//                 } else {
//                     setMessage('Failed to access media devices. Please check your permissions.');
//                 }
//             } else {
//                 setMessage('Invalid room or code');
//             }
//         } catch (error) {
//             setMessage('Error joining room: ' + (error.response?.data || 'Unknown error'));
//             console.error('Error during room joining:', error);
//         } finally {
//             setLoading(false);
//         }
//     };
    

//     useEffect(() => {
//         return () => {
//             if (stream) {
//                 stream.getTracks().forEach(track => track.stop());
//             }
//         };
//     }, [stream]);

//     return (
//         <div className="room-form-container">
//             <h2>Create Room</h2>
//             <button className="create-room-button" onClick={createRoom} disabled={loading}>
//                 {loading ? 'Creating...' : 'Create Room'}
//             </button>
//             {roomId && roomCode && (
//                 <div className="room-info">
//                     <p>Room ID: {roomId}</p>
//                     <p>Room Code: {roomCode}</p>
//                 </div>
//             )}
//             <h2>Join Room</h2>
//             <form onSubmit={joinRoom}>
//                 <div>
//                     <label>Room ID:</label>
//                     <input
//                         type="text"
//                         value={roomId}
//                         onChange={(e) => setRoomId(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label>Room Code:</label>
//                     <input
//                         type="text"
//                         value={roomCode}
//                         onChange={(e) => setRoomCode(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label>Participant ID:</label>
//                     <input
//                         type="text"
//                         value={participantId}
//                         onChange={(e) => setParticipantId(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <button type="submit" disabled={loading}>{loading ? 'Joining...' : 'Join Room'}</button>
//                 {message && <p className="message">{message}</p>}
//             </form>

//             {stream && (
//                 <video ref={localVideoRef} autoPlay muted className="local-video"></video>
//             )}
//         </div>
//     );
// };

// export default RoomForm;

//Proper Working Code of Mine


// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import axios from 'axios';
// import './RoomForm.css';

// const RoomForm = ({ onRoomCreated }) => {
//     const [roomId, setRoomId] = useState('');
//     const [roomCode, setRoomCode] = useState('');
//     const [participantId, setParticipantId] = useState('');
//     const [message, setMessage] = useState('');
//     const [loading, setLoading] = useState(false);
//     const localVideoRef = useRef(null);
//     const remoteVideoRef = useRef(null);
//     const [stream, setStream] = useState(null);
//     const [peerConnection, setPeerConnection] = useState(null);
//     const signalingServerUrl = 'ws://localhost:8080/webrtc-signaling'; 

//     const signalingWebSocket = useRef(null);

//     const handleOffer = useCallback(async (offer) => {
//         if (peerConnection) {
//             await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//             const answer = await peerConnection.createAnswer();
//             await peerConnection.setLocalDescription(answer);
//             signalingWebSocket.current.send(JSON.stringify({ type: 'answer', answer }));
//         }
//     }, [peerConnection]);

//     const handleAnswer = useCallback(async (answer) => {
//         if (peerConnection) {
//             await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
//         }
//     }, [peerConnection]);

//     useEffect(() => {
//         signalingWebSocket.current = new WebSocket(signalingServerUrl);

//         signalingWebSocket.current.onmessage = async (message) => {
//             const data = JSON.parse(message.data);
//             if (data.type === 'offer') {
//                 handleOffer(data.offer);
//             } else if (data.type === 'answer') {
//                 handleAnswer(data.answer);
//             } else if (data.type === 'candidate') {
//                 if (peerConnection) {
//                     const candidate = new RTCIceCandidate(data.candidate);
//                     peerConnection.addIceCandidate(candidate);
//                 }
//             }
//         };

//         return () => {
//             signalingWebSocket.current.close();
//         };
//     }, [handleOffer, handleAnswer, peerConnection]);

//     const setupLocalStream = async () => {
//         try {
//             if (stream) {
//                 stream.getTracks().forEach(track => track.stop());
//             }

//             const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//             if (localVideoRef.current) {
//                 localVideoRef.current.srcObject = mediaStream;
//             }
//             setStream(mediaStream);
//             return mediaStream;
//         } catch (error) {
//             setMessage('Error accessing media devices.');
//             console.error('Media error:', error);
//             return null;
//         }
//     };

//     const createRoom = async () => {
//         setLoading(true);
//         setMessage('');
//         try {
//             const response = await axios.post('http://localhost:8080/api/room/create');
//             setRoomId(response.data.roomId);
//             setRoomCode(response.data.roomCode);

//             const mediaStream = await setupLocalStream();
//             if (mediaStream) {
//                 setMessage('Room created successfully!');
//                 const roomInfo = { roomId: response.data.roomId, roomCode: response.data.roomCode, participantId };
//                 localStorage.setItem('roomInfo', JSON.stringify(roomInfo));
//                 onRoomCreated({ roomId: response.data.roomId, roomCode: response.data.roomCode, stream: mediaStream });
//                 initializePeerConnection(mediaStream); // Initialize WebRTC Peer Connection
//             } else {
//                 setMessage('Failed to access media devices.');
//             }
//         } catch (error) {
//             setMessage('Error creating room.');
//             console.error('Error creating room:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const joinRoom = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage('');
//         try {
//             const response = await axios.post('http://localhost:8080/api/room/join', null, {
//                 params: { roomId, roomCode, participantId },
//             });

//             if (response.data === 'Joined successfully') {
//                 const mediaStream = await setupLocalStream();
//                 if (mediaStream) {
//                     setMessage('Joined room successfully!');
//                     const roomInfo = { roomId, roomCode, participantId };
//                     localStorage.setItem('roomInfo', JSON.stringify(roomInfo));
//                     onRoomCreated({ roomId, roomCode, stream: mediaStream, participantId });
//                     initializePeerConnection(mediaStream); // Initialize WebRTC Peer Connection
//                     signalingWebSocket.current.send(JSON.stringify({ type: 'join', roomId }));
//                 } else {
//                     setMessage('Failed to access media devices.');
//                 }
//             } else {
//                 setMessage('Invalid room or code');
//             }
//         } catch (error) {
//             setMessage('Error joining room.');
//             console.error('Error joining room:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const initializePeerConnection = (localStream) => {
//         const pc = new RTCPeerConnection({
//             iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//         });
    
//         pc.onicecandidate = (event) => {
//             if (event.candidate) {
//                 signalingWebSocket.current.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
//             }
//         };
    
//         pc.ontrack = (event) => {
//             if (remoteVideoRef.current) {
//                 remoteVideoRef.current.srcObject = event.streams[0];
//             }
//         };
    
//         pc.oniceconnectionstatechange = () => {
//             console.log('ICE Connection State:', pc.iceConnectionState);
//         };
    
//         localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
//         setPeerConnection(pc);
//     };
    

//     useEffect(() => {
//         return () => {
//             if (stream) {
//                 stream.getTracks().forEach(track => track.stop());
//             }
//         };
//     }, [stream]);

//     return (
//         <div className="room-form-container">
//             <h2>Create Room</h2>
//             <button className="create-room-button" onClick={createRoom} disabled={loading}>
//                 {loading ? 'Creating...' : 'Create Room'}
//             </button>
//             {roomId && roomCode && (
//                 <div className="room-info">
//                     <p>Room ID: {roomId}</p>
//                     <p>Room Code: {roomCode}</p>
//                 </div>
//             )}
//             <h2>Join Room</h2>
//             <form onSubmit={joinRoom}>
//                 <div>
//                     <label>Room ID:</label>
//                     <input
//                         type="text"
//                         value={roomId}
//                         onChange={(e) => setRoomId(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label>Room Code:</label>
//                     <input
//                         type="text"
//                         value={roomCode}
//                         onChange={(e) => setRoomCode(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label>Participant ID:</label>
//                     <input
//                         type="text"
//                         value={participantId}
//                         onChange={(e) => setParticipantId(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <button type="submit" disabled={loading}>{loading ? 'Joining...' : 'Join Room'}</button>
//                 {message && <p className="message">{message}</p>}
//             </form>

//             <div className="video-container">
//                 <video ref={localVideoRef} autoPlay muted className="local-video"></video>
//                 <video ref={remoteVideoRef} autoPlay className="remote-video"></video>
//             </div>
//         </div>
//     );
// };

// export default RoomForm;


//Full running code on local

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import axios from 'axios';
// import './RoomForm.css';

// const RoomForm = ({ onRoomCreated }) => {
//     const [roomId, setRoomId] = useState('');
//     const [roomCode, setRoomCode] = useState('');
//     const [participantId, setParticipantId] = useState('');
//     const [message, setMessage] = useState('');
//     const [loading, setLoading] = useState(false);
//     const localVideoRef = useRef(null);
//     const remoteVideoRef = useRef(null);
//     const [stream, setStream] = useState(null);
//     const [peerConnection, setPeerConnection] = useState(null);
//     const signalingServerUrl = 'ws://localhost:8080/webrtc-signaling'; 
//     const signalingWebSocket = useRef(null);

//     const handleOffer = useCallback(async (offer) => {
//         if (peerConnection) {
//             await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//             const answer = await peerConnection.createAnswer();
//             await peerConnection.setLocalDescription(answer);
//             signalingWebSocket.current.send(JSON.stringify({ type: 'answer', answer }));
//         }
//     }, [peerConnection]);

//     const handleAnswer = useCallback(async (answer) => {
//         if (peerConnection) {
//             await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
//         }
//     }, [peerConnection]);

//     useEffect(() => {
//         signalingWebSocket.current = new WebSocket(signalingServerUrl);

//         signalingWebSocket.current.onmessage = async (message) => {
//             const data = JSON.parse(message.data);
//             switch(data.type) {
//                 case 'offer':
//                     handleOffer(data.offer);
//                     break;
//                 case 'answer':
//                     handleAnswer(data.answer);
//                     break;
//                 case 'candidate':
//                     if (peerConnection) {
//                         const candidate = new RTCIceCandidate(data.candidate);
//                         await peerConnection.addIceCandidate(candidate);
//                     }
//                     break;
//                 default:
//                     break;
//             }
//         };

//         signalingWebSocket.current.onerror = (error) => {
//             console.error('WebSocket error:', error);
//             setMessage('WebSocket error. Please try again later.');
//         };

//         return () => {
//             signalingWebSocket.current.close();
//         };
//     }, [handleOffer, handleAnswer, peerConnection]);

//     const setupLocalStream = async () => {
//         // Check for media device availability
//         if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//           setMessage('Media devices are not available in your browser.');
//           return null;
//         }
      
//         try {
//           // Stop existing tracks if there is an active stream
//           if (stream) {
//             stream.getTracks().forEach(track => {
//               track.stop();
//             });
//             setStream(null); // Reset stream state
//           }
      
//           // Request permission and get media stream
//           const mediaStream = await navigator.mediaDevices.getUserMedia({
//             video: true,
//             audio: true,
//           });
      
//           // Handle permission errors
//           if (mediaStream === null) {
//             setMessage('Permission denied. Please allow access to camera and microphone.');
//             return null;
//           }
      
//           if (localVideoRef.current) {
//             localVideoRef.current.srcObject = mediaStream; // Set local video source
//           }
      
//           setStream(mediaStream); // Save the stream
//           return mediaStream;
//         } catch (error) {
//             setMessage('Error accessing media devices.');
//             console.error('Media error:', error);
//             return null;
//         }
//     };

//     const createRoom = async () => {
//         setLoading(true);
//         setMessage('');
//         try {
//             const response = await axios.post('http://localhost:8080/api/room/create');
//             setRoomId(response.data.roomId);
//             setRoomCode(response.data.roomCode);

//             const mediaStream = await setupLocalStream();
//             if (mediaStream) {
//                 setMessage('Room created successfully!');
//                 const roomInfo = { roomId: response.data.roomId, roomCode: response.data.roomCode, participantId };
//                 localStorage.setItem('roomInfo', JSON.stringify(roomInfo));
//                 onRoomCreated({ roomId: response.data.roomId, roomCode: response.data.roomCode, stream: mediaStream });
//                 initializePeerConnection(mediaStream); // Initialize WebRTC Peer Connection
//             } else {
//                 setMessage('Failed to access media devices.');
//             }
//         } catch (error) {
//             setMessage('Error creating room.');
//             console.error('Error creating room:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const joinRoom = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage('');
//         try {
//             const response = await axios.post('http://localhost:8080/api/room/join', null, {
//                 params: { roomId, roomCode, participantId },
//             });

//             if (response.data === 'Joined successfully') {
//                 const mediaStream = await setupLocalStream();
//                 if (mediaStream) {
//                     setMessage('Joined room successfully!');
//                     const roomInfo = { roomId, roomCode, participantId };
//                     localStorage.setItem('roomInfo', JSON.stringify(roomInfo));
//                     onRoomCreated({ roomId, roomCode, stream: mediaStream, participantId });
//                     initializePeerConnection(mediaStream); // Initialize WebRTC Peer Connection
//                     signalingWebSocket.current.send(JSON.stringify({ type: 'join', roomId }));
//                 } else {
//                     setMessage('Failed to access media devices.');
//                 }
//             } else {
//                 setMessage('Invalid room or code');
//             }
//         } catch (error) {
//             setMessage('Error joining room.');
//             console.error('Error joining room:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const initializePeerConnection = (localStream) => {
//         const pc = new RTCPeerConnection({
//             iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//         });

//         pc.onicecandidate = (event) => {
//             if (event.candidate) {
//                 signalingWebSocket.current.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
//             }
//         };

//         pc.ontrack = (event) => {
//             if (remoteVideoRef.current) {
//                 remoteVideoRef.current.srcObject = event.streams[0];
//             }
//         };

//         pc.oniceconnectionstatechange = () => {
//             console.log('ICE Connection State:', pc.iceConnectionState);
//         };

//         localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
//         setPeerConnection(pc);
//     };

//     useEffect(() => {
//         return () => {
//             if (stream) {
//                 stream.getTracks().forEach(track => track.stop());
//             }
//         };
//     }, [stream]);

//     return (
//         <div className="room-form-container">
//             <h2>Create Room</h2>
//             <button className="create-room-button" onClick={createRoom} disabled={loading}>
//                 {loading ? 'Creating...' : 'Create Room'}
//             </button>
//             {roomId && roomCode && (
//                 <div className="room-info">
//                     <p>Room ID: {roomId}</p>
//                     <p>Room Code: {roomCode}</p>
//                 </div>
//             )}
//             <h2>Join Room</h2>
//             <form onSubmit={joinRoom}>
//                 <div>
//                     <label>Room ID:</label>
//                     <input
//                         type="text"
//                         value={roomId}
//                         onChange={(e) => setRoomId(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label>Room Code:</label>
//                     <input
//                         type="text"
//                         value={roomCode}
//                         onChange={(e) => setRoomCode(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label>Participant ID:</label>
//                     <input
//                         type="text"
//                         value={participantId}
//                         onChange={(e) => setParticipantId(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <button type="submit" disabled={loading}>{loading ? 'Joining...' : 'Join Room'}</button>
//                 {message && <p className="message">{message}</p>}
//             </form>

//             <div className="video-container">
//                 <video ref={localVideoRef} autoPlay muted className="local-video"></video>
//                 <video ref={remoteVideoRef} autoPlay className="remote-video"></video>
//             </div>
//         </div>
//     );
// };

// export default RoomForm;


import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './RoomForm.css';

const RoomForm = ({ onRoomCreated }) => {
    const [roomId, setRoomId] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [participantId, setParticipantId] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    
    // Updated signaling server URL
    const signalingServerUrl = 'wss://video-call-application-5f1u.onrender.com/webrtc-signaling'; 
    const signalingWebSocket = useRef(null);

    const handleOffer = useCallback(async (offer) => {
        if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            signalingWebSocket.current.send(JSON.stringify({ type: 'answer', answer }));
        }
    }, [peerConnection]);

    const handleAnswer = useCallback(async (answer) => {
        if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }, [peerConnection]);

    useEffect(() => {
        signalingWebSocket.current = new WebSocket(signalingServerUrl);

        signalingWebSocket.current.onmessage = async (message) => {
            const data = JSON.parse(message.data);
            switch(data.type) {
                case 'offer':
                    handleOffer(data.offer);
                    break;
                case 'answer':
                    handleAnswer(data.answer);
                    break;
                case 'candidate':
                    if (peerConnection) {
                        const candidate = new RTCIceCandidate(data.candidate);
                        await peerConnection.addIceCandidate(candidate);
                    }
                    break;
                default:
                    break;
            }
        };

        signalingWebSocket.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setMessage('WebSocket error. Please try again later.');
        };

        return () => {
            signalingWebSocket.current.close();
        };
    }, [handleOffer, handleAnswer, peerConnection]);

    const setupLocalStream = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setMessage('Media devices are not available in your browser.');
            return null;
        }
      
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
      
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
      
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = mediaStream;
            }
      
            setStream(mediaStream);
            return mediaStream;
        } catch (error) {
            setMessage('Error accessing media devices. Please check permissions.');
            console.error('Media error:', error);
            return null;
        }
    };

    const createRoom = async () => {
        setLoading(true);
        setMessage('');
        try {
            // Updated API endpoint for room creation
            const response = await axios.post('https://video-call-application-5f1u.onrender.com/api/room/create');
            setRoomId(response.data.roomId);
            setRoomCode(response.data.roomCode);

            const mediaStream = await setupLocalStream();
            if (mediaStream) {
                setMessage('Room created successfully!');
                const roomInfo = { roomId: response.data.roomId, roomCode: response.data.roomCode, participantId };
                localStorage.setItem('roomInfo', JSON.stringify(roomInfo));
                onRoomCreated({ roomId: response.data.roomId, roomCode: response.data.roomCode, stream: mediaStream });
                initializePeerConnection(mediaStream);
            } else {
                setMessage('Failed to access media devices.');
            }
        } catch (error) {
            setMessage('Error creating room. Please try again.');
            console.error('Error creating room:', error);
        } finally {
            setLoading(false);
        }
    };

    const joinRoom = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            // Updated API endpoint for joining a room
            const response = await axios.post('https://video-call-application-5f1u.onrender.com/api/room/join', null, {
                params: { roomId, roomCode, participantId },
            });

            if (response.data === 'Joined successfully') {
                const mediaStream = await setupLocalStream();
                if (mediaStream) {
                    setMessage('Joined room successfully!');
                    const roomInfo = { roomId, roomCode, participantId };
                    localStorage.setItem('roomInfo', JSON.stringify(roomInfo));
                    onRoomCreated({ roomId, roomCode, stream: mediaStream, participantId });
                    initializePeerConnection(mediaStream);
                    signalingWebSocket.current.send(JSON.stringify({ type: 'join', roomId }));
                } else {
                    setMessage('Failed to access media devices.');
                }
            } else {
                setMessage('Invalid room ID or code. Please try again.');
            }
        } catch (error) {
            setMessage('Error joining room. Please check your credentials and try again.');
            console.error('Error joining room:', error);
        } finally {
            setLoading(false);
        }
    };

    const initializePeerConnection = (localStream) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                signalingWebSocket.current.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
            }
        };

        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log('ICE Connection State:', pc.iceConnectionState);
        };

        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
        setPeerConnection(pc);
    };

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (peerConnection) {
                peerConnection.close();
            }
        };
    }, [stream, peerConnection]);

    return (
        <div className="room-form-container">
            <h2>Create Room</h2>
            <button className="create-room-button" onClick={createRoom} disabled={loading}>
                {loading ? 'Creating...' : 'Create Room'}
            </button>
            {roomId && roomCode && (
                <div className="room-info">
                    <p>Room ID: {roomId}</p>
                    <p>Room Code: {roomCode}</p>
                </div>
            )}
            <h2>Join Room</h2>
            <form onSubmit={joinRoom}>
                <div>
                    <label>Room ID:</label>
                    <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Room Code:</label>
                    <input
                        type="text"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Participant ID:</label>
                    <input
                        type="text"
                        value={participantId}
                        onChange={(e) => setParticipantId(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Joining...' : 'Join Room'}
                </button>
            </form>
            {message && <div className="message">{message}</div>}
            <div className="video-container">
                <video ref={localVideoRef} autoPlay muted className="local-video" />
                <video ref={remoteVideoRef} autoPlay className="remote-video" />
            </div>
        </div>
    );
};

export default RoomForm;
