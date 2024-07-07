import pools from "../db/connect.db.js";
import gameSessionsManager from "../session/game.session.js";
import { testAllDbConnections } from "../utils/db/test-db-connection.js";
import { loadProtoFiles } from "./proto.init.js";

export const initServer = async () => {
  try {
   
// 여기에 assets/proto 파일을 로드합니다.
    await loadProtoFiles();
    await testAllDbConnections(pools);
    gameSessionsManager.addGameSession(0);
  } catch (err) {
    //
    console.error(err);
    process.exit(1);
  }
};