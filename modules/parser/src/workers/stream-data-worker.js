import {setXVIZConfig, setXVIZSettings} from '../config/xviz-config';
import {parseStreamDataMessage} from '../parsers/parse-stream-data-message';
import {preSerialize} from '../parsers/serialize';

export default config => self => {
  setXVIZConfig(config);

  function onResult(message) {
    const transfers = [];
    const {streams} = message;

    if (streams) {
      for (const streamName in streams) {
        const {pointCloud, imageData} = streams[streamName];
        if (pointCloud) {
          transfers.push(
            pointCloud.ids.buffer,
            pointCloud.colors.buffer,
            pointCloud.positions.buffer
          );
        }
        if (imageData) {
          transfers.push(imageData.buffer);
        }
      }
    }

    message = preSerialize(message);
    self.postMessage(message, transfers);
  }

  function onError(error) {
    throw error;
  }

  self.onmessage = e => {
    if (e.data.xvizSettings) {
      setXVIZSettings(e.data.xvizSettings);
    } else {
      parseStreamDataMessage(e.data, onResult, onError);
    }
  };
};
