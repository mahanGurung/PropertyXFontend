import { useWallet } from '../../contexts/WalletContext';
import { shortenAddress } from '../../lib/utils';

const ConnectWallet = ({ mobile = false, onClick = () => {} }) => {
  const { connected, stxAddress, connect, disconnect } = useWallet();

  const handleConnect = () => {
    connect();
    if (onClick) onClick();
  };

  const handleDisconnect = () => {
    disconnect();
    if (onClick) onClick();
  };

  if (!connected) {
    return (
      <button
        onClick={handleConnect}
        className={`${
          mobile ? 'w-full' : ''
        } bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition`}
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className={`${mobile ? 'space-y-2' : 'flex items-center space-x-2'}`}>
      <span className={`${mobile ? 'px-3 py-2 text-center' : 'px-3 py-1'} bg-neutral-100 rounded-lg font-mono text-xs`}>
        {shortenAddress(stxAddress || '', mobile ? 10 : 6)}
      </span>
      <button
        onClick={handleDisconnect}
        className={`${
          mobile ? 'w-full py-2' : ''
        } text-sm text-error-500 hover:text-error-600`}
      >
        Disconnect
      </button>
    </div>
  );
};

export default ConnectWallet;
