import { MdComputer, MdSmartphone, MdTablet } from 'react-icons/md';
import Device from "../../types/Device";

type DeviceSelectorProps = {
  className?: string;
  deviceId: string,
  devices: Device[],
  handleSelectDevice: (event: React.MouseEvent, selectedDeviceId: string) => Promise<void>;
};

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  className,
  deviceId,
  devices,
  handleSelectDevice,
}) => {
  return (
    <div className="flex flex-col items-center h-full mt-10">
      <div className="flex flex-col w-full justify-center items-center mb-10">
        <div className="flex mb-4">
          <MdComputer className="w-24 h-24 md:w-40m md:h-40" />
          <MdSmartphone className="w-24 h-24 md:w-40m md:h-40" />
          <MdTablet className="w-24 h-24 md:w-40m md:h-40" />
        </div>
        <div className="text-2xl md:text-4xl font-bold">
          Connect to a device
        </div>
      </div>
      <div className="flex flex-col w-full md:w-3/4 overflow-auto mb-10">
        {devices.map((device) => (
          <div
            className={`group flex items-center px-2 py-4 border-b-2 border-opacity-10 hover:bg-gray-500 hover:bg-opacity-25 cursor-pointer ${device.is_active ? 'text-green-400' : ''}`}
            key={device.id}
            onClick={(e) => handleSelectDevice(e, device.id)}
          >
            <div className="mr-4">
              {device.type.toLowerCase() === 'computer' ? <MdComputer /> : <MdSmartphone />}
            </div>
            <div>
              {device.name} {deviceId === device.id && (<b>(This Device)</b>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceSelector;
