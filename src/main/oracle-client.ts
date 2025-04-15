import { join as pathJoin } from "path";
import OracleDB from "oracledb";

export type User = {
  ID: number;
  NAME: string;
  DELETED: Date;
  CREATED: Date;
};

export type UserLastPlayed = {
  LAST_PLAYED: string;
  ID: number;
};

// export async function initPool(): Promise<void> {
//   try {
//     OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

//     process.env.TNS_ADMIN = pathJoin(
//       __dirname,
//       `.${import.meta.env["VITE_ORACLE_WALLET_PATH"]}`,
//     );
//     await OracleDB.createPool({
//       user: import.meta.env["VITE_ORACLE_USER"],
//       password: import.meta.env["VITE_ORACLE_WALLET_PW"],
//       connectString: "sampledwdb19c_high",
//       poolMin: 1,
//       poolMax: 10,
//       poolIncrement: 1,
//       sessionCallback: async (conn) => {
//         await conn.execute("ALTER SESSION SET RESULT_CACHE_MODE = MANUAL");
//       },
//     });
//   } catch (error) {
//     console.log("Error creating pool: " + error);
//     throw new Error("Error creating pool: " + error);
//   }
// }

async function oracleConnection(): Promise<OracleDB.Connection | null> {
  try {
    OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

    const walletPath: string = pathJoin(
      __dirname,
      `.${import.meta.env["VITE_ORACLE_WALLET_PATH"]}`,
    );
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
  }
}

export const addUser = async (name: string) => {
  const cn = await oracleConnection();
  if (!cn) return;

  await cn.execute("begin api.add_user(:p_name); end;", {
    p_name: {
      val: name,
      dir: OracleDB.BIND_IN,
      type: OracleDB.STRING,
      maxSize: 512,
    },
  });
  cn.close;
};

export const deleteUser = async (id: number) => {
  const cn = await oracleConnection();
  if (!cn) return;

  await cn.execute("begin api.delete_user(:p_id); end;", {
    p_id: {
      val: id,
      dir: OracleDB.BIND_IN,
      type: OracleDB.NUMBER,
    },
  });
  cn.close;
};

export const getUsers = async (): Promise<User[] | undefined> => {
  const cn = await oracleConnection();
  if (!cn) return undefined;

  await cn.execute("ALTER SESSION SET RESULT_CACHE_MODE = MANUAL");
  const exec = await cn.execute("select t.* from table(api.get_users) t");
  const result = exec as OracleDB.Result<User>;

  cn.close;
  return result.rows;
};

export const addUserLastPlayed = async (userId: number, lastPlayed: string) => {
  const cn = await oracleConnection();
  if (!cn) return;

  await cn.execute(
    "begin api.add_user_last_played(:p_user_id, :p_last_played); end;",
    {
      p_user_id: {
        val: userId,
        dir: OracleDB.BIND_IN,
        type: OracleDB.NUMBER,
      },
      p_last_played: {
        val: lastPlayed,
        dir: OracleDB.BIND_IN,
        type: OracleDB.STRING,
        maxSize: 512,
      },
    },
  );
  cn.close;
};

export const getUserLastPlayed = async (
  id: number,
): Promise<UserLastPlayed | undefined> => {
  const cn = await oracleConnection();
  if (!cn) return undefined;

  await cn.execute("ALTER SESSION SET RESULT_CACHE_MODE = MANUAL");
  const exec = await cn.execute(
    "select t.* from table(api.get_user_last_played(:p_user_id)) t",
    {
      p_user_id: {
        val: id,
        dir: OracleDB.BIND_IN,
        type: OracleDB.NUMBER,
      },
    },
  );
  const result = exec as OracleDB.Result<UserLastPlayed>;
  const rr = result.rows ? result.rows[0] : result.rows;

  cn.close;
  return rr;
};
