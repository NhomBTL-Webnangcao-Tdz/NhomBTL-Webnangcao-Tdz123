import { useEffect, useState } from 'react';
import { studentApi } from '../../api/student.api';
import { useAuth } from '../../context/AuthContext';
import BillsPage from './BillsPage';
import ContactPage from './ContactPage';
import ProfilePage from './ProfilePage';
import RoomPage from './RoomPage';
import './StudentShared.css';

export default function StudentPortalPage({ page, params }) {
  const { user } = useAuth();
  const [portal, setPortal] = useState(null);
  const [loading, setLoading] = useState(page !== 'my-contact');
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const retry = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    if (page === 'my-contact') return undefined;
    let active = true;
    let firstLoad = true;
    let requestInFlight = false;
    const loadPortal = async () => {
      if (requestInFlight) return;
      requestInFlight = true;
      if (firstLoad) setLoading(true);
      setError('');
      try {
        const result = await studentApi.portal();
        if (active) setPortal(result);
      } catch (requestError) {
        if (active) setError(requestError.message || 'Không thể tải dữ liệu sinh viên.');
      } finally {
        requestInFlight = false;
        firstLoad = false;
        if (active) setLoading(false);
      }
    };

    loadPortal();
    const refreshInterval = page === 'my-bills'
      ? window.setInterval(loadPortal, 15000)
      : null;
    return () => {
      active = false;
      if (refreshInterval !== null) window.clearInterval(refreshInterval);
    };
  }, [page, reloadKey]);

  const saveProfile = (result) => setPortal(result);
  const sendResidenceRequest = async (request) => {
    await studentApi.requestResidence(request);
    retry();
  };

  if (page === 'my-profile') {
    return <ProfilePage user={user} portal={portal} loading={loading} error={error} retry={retry} onSaved={saveProfile} />;
  }
  if (page === 'my-room') {
    return <RoomPage portal={portal} loading={loading} error={error} retry={retry} onRequest={sendResidenceRequest} />;
  }
  if (page === 'my-bills') {
    return <BillsPage portal={portal} loading={loading} error={error} retry={retry} />;
  }
  return <ContactPage user={user} params={params} />;
}
