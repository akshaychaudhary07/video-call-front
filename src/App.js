import React, { useState } from 'react';
import VideoChat from './components/VideoChat';
import RoomForm from './components/RoomForm';

const App = () => {
    const [roomData, setRoomData] = useState(null);
    const [localStream, setLocalStream] = useState(null);

    const handleRoomCreated = (data) => {
        setRoomData(data);
        setLocalStream(data.stream);
    };

    return (
        <div>
            {!roomData ? (
                <RoomForm onRoomCreated={handleRoomCreated} />
            ) : (
                <VideoChat room={roomData} stream={localStream} />
            )}
        </div>
    );
};

export default App;
