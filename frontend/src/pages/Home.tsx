import { useCallback, useEffect, useState } from 'react';
import Box from '../components/Box';
import Button from '../components/Button';
import Hyperlink from '../components/Hyperlink';
import Modal from '../components/Modal';
import { FaTrash } from 'react-icons/fa';

type Machine = { id: string; mac: string };

const WakeButton = ({ id, mac }: Machine) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<null | 'done' | 'error'>(null);

  const wake = () => {
    if (loading) return;
    if (state !== null) return;

    setLoading(true);
    fetch(`/api/machines/wake?mac=${mac}`, { method: 'POST' })
      .then(() => setState('done'))
      .catch(() => setState('error'))
      .finally(() => {
        setLoading(false);
        setTimeout(close, 2_500);
      });
  };

  const close = () => {
    setOpen(false);
    setLoading(false);
    setState(null);
  };

  return (
    <>
      <Button primary onClick={() => setOpen(true)} className="px-4">
        wake
      </Button>
      <Modal open={open} onClose={close}>
        <b>
          wake <span className="text-purple-400">{id}</span>
        </b>
        <p>
          send a wol packet to <span className="text-purple-400">{mac}</span>?
        </p>
        <div className="flex items-center justify-end gap-4 mt-4 mb-2">
          <Button primary onClick={wake} disabled={loading || state !== null}>
            {loading
              ? 'waking...'
              : state === 'done'
                ? 'success!'
                : state === 'error'
                  ? 'error!'
                  : 'wake'}
          </Button>
          <Button onClick={close}>cancel</Button>
        </div>
      </Modal>
    </>
  );
};

const DeleteButton = ({ id, refresh }: Machine & { refresh?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<null | 'done' | 'error'>(null);

  const wake = () => {
    if (loading) return;
    if (state !== null) return;

    setLoading(true);
    fetch(`/api/machines?id=${id}`, { method: 'DELETE' })
      .then(() => setState('done'))
      .catch(() => setState('error'))
      .finally(() => {
        refresh?.();
        setLoading(false);
        setTimeout(close, 2_500);
      });
  };

  const close = () => {
    setOpen(false);
    setLoading(false);
    setState(null);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="px-4">
        <FaTrash />
      </Button>
      <Modal open={open} onClose={close}>
        <b>
          delete <span className="text-purple-400">{id}</span>
        </b>
        <p>
          are you sure you'd like to delete{' '}
          <span className="text-purple-400">{id}</span> from your machines?
        </p>
        <div className="flex items-center justify-end gap-4 mt-4 mb-2">
          <Button primary onClick={wake} disabled={loading || state !== null}>
            {loading
              ? 'deleting...'
              : state === 'done'
                ? 'success!'
                : state === 'error'
                  ? 'error!'
                  : 'delete'}
          </Button>
          <Button onClick={close}>cancel</Button>
        </div>
      </Modal>
    </>
  );
};

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState<Machine[]>([]);

  const refresh = useCallback(() => {
    fetch('/api/machines')
      .then((res) => res.json())
      .then((data) => setMachines(data as Machine[]))
      .catch(() => console.error('failed to fetch machines'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <>
      {loading && <Box primary>loading your machines...</Box>}
      {!loading && !machines.length && (
        <Box primary>
          <b className="text-xl">welcome to wolapp</b>
          <p>
            get started by <Hyperlink to="/add">adding a machine</Hyperlink>.
          </p>
        </Box>
      )}
      {!loading && !!machines.length && (
        <Box primary>
          <b className="text-xl">machines</b>
          <p>
            you've added {machines.length}{' '}
            {machines.length === 1 ? 'machine' : 'machines'}. click a machine
            below to wake it, or{' '}
            <Hyperlink to="/add">add another machine</Hyperlink>.
          </p>
        </Box>
      )}
      {machines.map((m) => (
        <div key={m.id} className="flex items-stretch gap-4">
          <Box key={m.id} className="grow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/*<div className="w-2.5 h-2.5 rounded-full bg-green-300 border border-green-600"></div>*/}
                <div className="w-2.5 h-2.5 rounded-full bg-stone-600/40 border border-stone-500"></div>
                <b>{m.id}</b>
              </div>
              <span>{m.mac}</span>
            </div>
          </Box>
          <WakeButton {...m} />
          <DeleteButton {...m} refresh={refresh} />
        </div>
      ))}
    </>
  );
};

export default Home;
