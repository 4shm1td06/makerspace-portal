import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const MeetingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(null);
  const apiRef = useRef(null);

  useEffect(() => {
    const checkPermissions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !profile || profile.role !== 'admin') {
        return navigate('/dashboard');
      }

      setAllowed(true);
    };

    checkPermissions();
  }, [navigate]);

  useEffect(() => {
    if (!allowed) return;

    const domain = 'meet.jit.si';
    const loadJitsi = () => {
      if (!window.JitsiMeetExternalAPI) {
        console.error('❌ Jitsi Meet API not loaded');
        return;
      }

      const options = {
        roomName: roomId || 'TestRoom',
        width: '100%',
        height: 700,
        parentNode: document.getElementById('jitsi-container'),
        configOverwrite: {
          disableInviteFunctions: true,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
        },
        userInfo: {
          displayName: 'Ashmit Sharma', // Replace with dynamic name if needed
        },
      };

      try {
        apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
      } catch (error) {
        console.error('❌ Failed to initialize Jitsi Meet API:', error);
      }
    };

    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = `https://${domain}/external_api.js`;
      script.async = true;
      script.onload = loadJitsi;
      script.onerror = () => console.error('❌ Failed to load Jitsi external_api.js');
      document.body.appendChild(script);
    } else {
      loadJitsi();
    }

    return () => {
      apiRef.current?.dispose?.();
      const container = document.getElementById('jitsi-container');
      if (container) container.innerHTML = '';
    };
  }, [allowed, roomId]);

  if (allowed === null) {
    return <div className="text-white text-center mt-20">🔒 Checking meeting permissions...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl mb-4 font-bold">Meeting Room: {roomId}</h1>
      <div id="jitsi-container" className="w-full max-w-5xl mx-auto rounded-lg overflow-hidden" />
    </div>
  );
};

export default MeetingRoom;
