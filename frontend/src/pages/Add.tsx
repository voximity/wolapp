import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Box from '../components/Box';
import Button from '../components/Button';
import { useSearchParams } from 'react-router';
import Hyperlink from '../components/Hyperlink';
import { Link } from 'react-router';

const MAC_REGEX = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
const validateMac = (mac: string) => MAC_REGEX.test(mac);

const AddSelf = ({ setMac }: { setMac: (mac: string) => void }) => {
  const [query] = useSearchParams();
  const [myIp, setMyIp] = useState<string>('');
  const [macs, setMacs] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/arp/me')
      .then((r) => r.json())
      .then((d) => {
        setMyIp(d.ip);
        setMacs(d.macs);
      });
  }, []);

  if (query.has('mac')) return null;
  if (!macs.length) return null;

  return (
    <>
      <Box primary className="mb-12">
        <b className="text-xl">add self</b>
        <p>
          the device you are visiting this page from is in wolapp's{' '}
          <Hyperlink to="/arp">arp table</Hyperlink> from ip{' '}
          <span className="text-purple-400">{myIp}</span>. would you like to add
          it as a wakable machine?
        </p>
        <div className="flex mt-2 mb-2 gap-4 flex-wrap">
          {macs.map((m) => (
            <Link to={`/add?mac=${m}`} key={m} onClick={() => setMac(m)}>
              <Button primary>add {m}</Button>
            </Link>
          ))}
        </div>
      </Box>
    </>
  );
};

const Add = () => {
  const navigate = useNavigate();
  const [query] = useSearchParams();

  const [error, setError] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [mac, setMac] = useState(() => query.get('mac') ?? '');

  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (loading) return;
    if (!name.trim()) return setError('specify a name.');
    if (!mac.trim()) return setError('specify a mac address.');
    if (!validateMac(mac))
      return setError('mac address is in an invalid form.');

    setError(undefined);
    setLoading(true);

    fetch('/api/machines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: name, mac }),
    })
      .then(() => navigate('/'))
      .catch(() => setError('error occurred adding the machine :/'))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <AddSelf setMac={setMac} />
      <Box primary>
        <b className="text-xl">add machine</b>
        <p>provide some information about your machine to add it as wakable.</p>
      </Box>
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="name"
          className="border py-2 px-4 bg-stone-200/20 border-stone-400 grow shrink-0"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="01:23:45:67:89:ab"
          className="border py-2 px-4 bg-stone-200/20 border-stone-400 grow shrink-0"
          value={mac}
          onChange={(e) => setMac(e.target.value)}
        />
      </div>
      <Button primary className="py-3" onClick={submit}>
        add machine
      </Button>
      {error && <Box error>{error}</Box>}
    </>
  );
};

export default Add;
