import { protoTypeNames } from "../constants/proto.constants.js";
import { serialize } from "../utils/packet/packet-encoder.utils.js";
import PingData from "../protobuf/common/ping.proto.js";
import { headerConstants } from "../constants/header.constants.js";
import CustomError from "../utils/errors/classes/custom.error.js";
import { errorCodes } from "../constants/error.constants.js";
import { handleError } from "../utils/errors/error-handler.js";

class User {
  constructor(id, playerId, socket, speed) {
    this.socket = socket;
    this.latency = 0;
    this.ping();
    this.id = id;
    this.playerId = playerId;
    this.speed = speed;
    this.x = 0;
    this.y = 0;
    // this.dt = 0;
    this.inputX = 0;
    this.inputY = 0;
    this.sequence = 0;
    this.updatedAt = Date.now();
  }

  updatePosition(x, y, inputX, inputY) {
    this.x = x;
    this.y = y;
    this.inputX = inputX;
    this.inputY = inputY;
   // const now = Date.now();
    // this.dt = (현재 - this.updatedAt) / 1000;
    // this.updatedAt = 지금;
    this.updatedAt = Date.now();
  }

  calculateNextPosition(t) {
  
// 거리 = 속도 * 시간
    const distance = this.speed * t;

    
// 각도는 입력 벡터를 통해 얻을 수 있습니다.
    if (this.inputX === 0 && this.inputY === 0) {
      return { x: this.x, y: this.y };
    }

    const theta = this.calculateTheta();

    // dx = cos(각도) * 거리
    const dx = Math.cos(theta) * distance;

// dy = sin(각도) * 거리
    const dy = Math.sin(theta) * distance;

    return { x: this.x + dx, y: this.y + dy };
  }

  calculateTheta() {
    return Math.atan2(this.inputY, this.inputX);
  }

  getNextSequence() {
    return ++this.sequence;
  }

  async ping() {
    try {
      const now = Date.now();

// 20초 동안 업데이트하지 않는다면 사용자 연결을 끊습니다.
      if (now - this.updatedAt > 20000) {
        throw new CustomError(errorCodes.SOCKET_ERROR, `Socket timeout: ${[this.id]}`);
      }
      console.log(`[${this.id}] PING`);
      const pingPacket = serialize(protoTypeNames.common.Ping, new PingData(now), headerConstants.packetTypes.PING);

      this.socket.write(pingPacket);
    } catch (err) {
      handleError(this.socket, err);
    }
  }

  async handlePong(data) {
    try {
      const now = Date.now();
      this.latency = (now - data.timestamp) / 2;
      console.log(`[${this.id}] PONG: ${this.latency}ms`);
    } catch (err) {
      handleError(this.socket, err);
    }
  }
}

export default User;
