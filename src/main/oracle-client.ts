import { join as pathJoin } from "path";
import OracleDB from "oracledb";

type LoggRow = {
  ID: number;
  ERROR_MSG: string;
};

async function createOracleConnection(): Promise<OracleDB.Connection | null> {
  try {
    OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

    const walletPath: string = pathJoin(__dirname, `./db/Wallet_sampledwdb19c`);
    const connection = await OracleDB.getConnection({
      user: import.meta.env["VITE_ORACLE_USER"],
      password: import.meta.env["VITE_ORACLE_PW"],
      connectString: "sampledwdb19c_high",
      configDir: walletPath,
      walletLocation: walletPath,
      walletPassword: import.meta.env["VITE_ORACLE_WALLET_PW"],
    });
    return connection;
  } catch (error) {
    throw new Error("Error connecting to database: " + error);
    // dialog.showMessageBoxSync({
    //   message: "Error connecting to database: " + error,

    //   type: "error",
    //   title: "Error!",
    // });
  }
}

export const testDb = async (): Promise<string | null> => {
  const cn = await createOracleConnection();
  if (!cn) return null;

  const exec = await cn.execute("select id, error_msg from logg");
  cn.close;

  const result = exec as OracleDB.Result<LoggRow>;
  if (!result.rows) return null;

  const rr = result.rows[0];
  return `{ID: ${rr.ID}, ERROR_MSG: ${rr.ERROR_MSG}}`;
};
