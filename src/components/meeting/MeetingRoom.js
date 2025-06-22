import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const MeetingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const apiRef = useRef(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        setAllowed(false);
        return;
      }

      const fallbackName = user.email?.split('@')[0] || null;

      if (profile.name?.trim()) {
        setDisplayName(profile.name);
        setAllowed(true);
      } else if (fallbackName) {
        setDisplayName(fallbackName);
        setAllowed(true);
      } else {
        setAllowed(false);
      }
    };

    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (!allowed) return;

    const domain = 'ju-makerspace-meet.duckdns.org';

    const loadJitsi = () => {
      if (!window.JitsiMeetExternalAPI) return;

      const options = {
  roomName: roomId || 'TestRoom',
  width: '100%',
  height: 700,
  parentNode: document.getElementById('jitsi-container'),
  configOverwrite: {
    disableInviteFunctions: true,
    disableDeepLinking: true,
    startWithAudioMuted: true,
    startWithVideoMuted: true,
    disableProfile: true, // 👈 Prevent name change
  },
  interfaceConfigOverwrite: {
    SHOW_JITSI_WATERMARK: false,
    SHOW_BRAND_WATERMARK: false,
    SHOW_POWERED_BY: false,
  },
  userInfo: {
    displayName,
  },
};


      try {
        apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
      } catch (err) {
        console.error('❌ Failed to initialize Jitsi:', err);
      }
    };

    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = `https://${domain}/external_api.js`;
      script.async = true;
      script.onload = loadJitsi;
      script.onerror = () => console.error('❌ Failed to load Jitsi API');
      document.body.appendChild(script);
    } else {
      loadJitsi();
    }

    return () => {
      if (apiRef.current?.dispose) apiRef.current.dispose();
      const container = document.getElementById('jitsi-container');
      if (container) container.innerHTML = '';
    };
  }, [allowed, roomId, displayName]);

  if (allowed === null) {
    return (
      <div className="text-white text-center mt-20">
        🔒 Verifying access...
      </div>
    );
  }

  if (allowed === false) {
    return (
      <div className="text-red-500 text-center mt-20">
        ❌ Access denied. You are not a registered member.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl mb-4 font-bold">Meeting Room: {roomId}</h1>
      <div
        id="jitsi-container"
        className="w-full max-w-5xl mx-auto rounded-lg overflow-hidden"
      />
    </div>
  );
};

export default MeetingRoom;
