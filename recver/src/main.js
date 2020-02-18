/* eslint-disable require-atomic-updates */
import { Device } from 'mediasoup-client';

const request = (path, query) => {
  const qs = query ? "?q=" + encodeURIComponent(JSON.stringify(query)) : "";
  return fetch(`http://localhost:3000/${path}${qs}`).then(res => res.json());
};

const [$setup, $consume] = document.querySelectorAll("button");
const [$pid] = document.querySelectorAll("input");

const state = {
  device: null,
  recvTransport: null,
  consumer: null
};

$setup.onclick = async () => {
  const routerRtpCapabilities = await request('rtpCapabilities');

  const device = new Device();
  await device.load({ routerRtpCapabilities });

  if (!device.canProduce('video'))
    throw new Error("Can not produce!");

  state.device = device;
  console.log("setup done");
};

$consume.onclick = async () => {
  if (state.recvTransport === null) {
    const {
      id,
      iceParameters,
      iceCandidates,
      dtlsParameters
    } = await request('createTransport', { direction: "recv" });

    const recvTransport = state.device.createRecvTransport({ id, iceParameters, iceCandidates, dtlsParameters });

    recvTransport.once("connect", ({ dtlsParameters }, callback, errback) =>
      request("transportConnect", {
        transportId: recvTransport.id,
        dtlsParameters
      })
        .then(callback)
        .catch(errback)
    );

    state.recvTransport = recvTransport;
  }

  const consumerInfo = await request('consume', {
    transportId: state.recvTransport.id,
    producerId: $pid.value,
    rtpCapabilities: state.device.rtpCapabilities
  });
  const consumer = await state.recvTransport.consume(consumerInfo);

  const $video = document.createElement('video');
  $video.controls = $video.muted = true;
  $video.srcObject = new MediaStream([consumer.track]);
  document.body.append($video);
  $video.play();
};
