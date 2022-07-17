import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const pc_config = {
    iceServers: [
        // {
        //   urls: 'stun:[STUN_IP]:[PORT]',
        //   'credentials': '[YOR CREDENTIALS]',
        //   'username': '[USERNAME]'
        // },
        {
            urls: 'stun:stun.l.google.com:19302',
        },
    ],
};
/* 서버 소켓 URL  */
const SOCKET_SERVER_URL = 'http://localhost:8080';

const CommonInterviewPage = () => {
    const [onMike, setOnMike] = useState(true);
    const [onScreen, setOnScreen] = useState(true);

    const stream = useRef<MediaStream>();
    const socketRef = useRef<SocketIOClient.Socket>();
    const pcRef = useRef<RTCPeerConnection>();
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const setVideoTracks = async () => {
        try {
            stream.current = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            if (localVideoRef.current) localVideoRef.current.srcObject = stream.current;
            if (!(pcRef.current && socketRef.current)) return;
            stream.current.getTracks().forEach((track) => {
                if (!pcRef.current) return;
                pcRef.current.addTrack(track, stream.current as MediaStream);
            });
            pcRef.current.onicecandidate = (e) => {
                if (e.candidate) {
                    if (!socketRef.current) return;
                    console.log('onicecandidate');
                    socketRef.current.emit('candidate', e.candidate);
                }
            };
            pcRef.current.oniceconnectionstatechange = (e) => {
                console.log(e);
            };
            pcRef.current.ontrack = (ev) => {
                console.log('add remotetrack success');
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = ev.streams[0];
                }
            };
            socketRef.current.emit('join_room', {
                room: '1234',
            });
        } catch (e) {
            console.error(e);
        }
    };

    const createOffer = async () => {
        console.log('create offer');
        if (!(pcRef.current && socketRef.current)) return;
        try {
            const sdp = await pcRef.current.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            });
            await pcRef.current.setLocalDescription(new RTCSessionDescription(sdp));
            socketRef.current.emit('offer', sdp);
        } catch (e) {
            console.error(e);
        }
    };

    const createAnswer = async (sdp: RTCSessionDescription) => {
        if (!(pcRef.current && socketRef.current)) return;
        try {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
            console.log('answer set remote description success');
            const mySdp = await pcRef.current.createAnswer({
                offerToReceiveVideo: true,
                offerToReceiveAudio: true,
            });
            console.log('create answer');
            await pcRef.current.setLocalDescription(new RTCSessionDescription(mySdp));
            socketRef.current.emit('answer', mySdp);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        socketRef.current = io.connect(SOCKET_SERVER_URL);
        pcRef.current = new RTCPeerConnection(pc_config);

        socketRef.current.on('all_users', (allUsers: Array<{ id: string }>) => {
            if (allUsers.length > 0) {
                createOffer();
            }
        });

        socketRef.current.on('getOffer', (sdp: RTCSessionDescription) => {
            //console.log(sdp);
            console.log('get offer');
            createAnswer(sdp);
        });

        socketRef.current.on('getAnswer', (sdp: RTCSessionDescription) => {
            console.log('get answer');
            if (!pcRef.current) return;
            pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
            //console.log(sdp);
        });

        socketRef.current.on('getCandidate', async (candidate: RTCIceCandidateInit) => {
            if (!pcRef.current) return;
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('candidate add success');
        });

        setVideoTracks();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (pcRef.current) {
                pcRef.current.close();
            }
        };
    }, []);
    function handleMike(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        if (stream.current !== undefined) {
            stream.current.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
        }
        if (!onMike) {
            setOnMike(true);
        } else {
            setOnMike(false);
        }
    }
    function handleScreen(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        console.log(stream);
        if (stream.current !== undefined) {
            stream.current.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
        }
        if (onScreen) {
            setOnScreen(false);
        } else {
            setOnScreen(true);
        }
    }
    function handleExit(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        window.close();
    }
    return (
        <div style={{ margin: 10 }}>
            <h1 style={{ fontSize: 30, textAlign: 'center', margin: 50 }}>샤샥 알바</h1>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <video
                    style={{
                        width: '50%',
                        height: '50%',
                        backgroundColor: 'blue',
                        padding: '10px',
                    }}
                    playsInline
                    muted
                    ref={localVideoRef}
                    autoPlay
                />
                <video
                    id="remotevideo"
                    style={{
                        width: '50%',
                        height: '50%',
                        backgroundColor: 'red',
                        padding: '10px',
                        zIndex: 2,
                    }}
                    ref={remoteVideoRef}
                    playsInline
                    autoPlay
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button id="mike" onClick={handleMike} style={{ width: '50px', margin: '10px', borderRadius: '15px' }}>
                    <img
                        src={onMike ? require(`../images/no-mute.png`) : require(`../images/mute.png`)}
                        width="25"
                        height="25"
                        alt="Mute On/Off"
                    />
                </button>{' '}
                <button id="screen" onClick={handleScreen} style={{ width: '50px', margin: '10px', borderRadius: '15px' }}>
                    <img
                        src={onScreen ? require(`../images/video.png`) : require(`../images/no-video.png`)}
                        width="25"
                        height="25"
                        alt="Screen On/Off"
                    />
                </button>{' '}
                <button id="exit" onClick={handleExit} style={{ width: '50px', margin: '10px', borderRadius: '15px' }}>
                    {' '}
                    <img src={require(`../images/logout.png`)} width="25" height="25" alt="Exit" />
                </button>
            </div>
        </div>
    );
};

export default CommonInterviewPage;
