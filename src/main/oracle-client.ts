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

export type FileBlobs = {
  ID: number;
  FILE_NAME: string;
  BLOB_DATA: Blob;
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

export const addUser = async (name: User["NAME"]): Promise<void> => {
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

export const deleteUser = async (id: User["ID"]): Promise<void> => {
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
  cn.close;

  const result = exec as OracleDB.Result<User>;

  return result.rows;
};

export const addUserLastPlayed = async (
  userId: UserLastPlayed["ID"],
  lastPlayed: UserLastPlayed["LAST_PLAYED"],
) => {
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
  userId: UserLastPlayed["ID"],
): Promise<UserLastPlayed | undefined> => {
  const cn = await oracleConnection();
  if (!cn) return undefined;

  await cn.execute("ALTER SESSION SET RESULT_CACHE_MODE = MANUAL");
  const exec = await cn.execute(
    "select t.* from table(api.get_user_last_played(:p_user_id)) t",
    {
      p_user_id: {
        val: userId,
        dir: OracleDB.BIND_IN,
        type: OracleDB.NUMBER,
      },
    },
  );
  cn.close;

  const result = exec as OracleDB.Result<UserLastPlayed>;
  const rr = result.rows ? result.rows[0] : result.rows;

  return rr;
};

export const uploadFile = async (
  fileName: FileBlobs["FILE_NAME"],
  blobData: FileBlobs["BLOB_DATA"],
) => {
  const cn = await oracleConnection();
  if (!cn) return;

  await cn.execute("begin fs.upload_file(:p_file_name, :p_blob_data); end;", {
    p_file_name: {
      val: fileName,
      dir: OracleDB.BIND_IN,
      type: OracleDB.STRING,
      maxSize: 512,
    },
    p_blob_data: {
      val: blobData,
      dir: OracleDB.BIND_IN,
      type: OracleDB.BLOB,
    },
  });
  cn.close;
};

export const getFileBlobData = async (
  fileName: FileBlobs["FILE_NAME"],
): Promise<FileBlobs["BLOB_DATA"] | undefined> => {
  const cn = await oracleConnection();
  if (!cn) return undefined;

  const exec: OracleDB.Result<{ ret: unknown }> = await cn.execute(
    "begin :ret := fs.get_file_blob_data(:p_file_name); end;",
    {
      p_file_name: {
        val: fileName,
        dir: OracleDB.BIND_IN,
        type: OracleDB.STRING,
        maxSize: 512,
      },

      ret: { dir: OracleDB.BIND_OUT, type: OracleDB.BLOB },
    },
  );
  cn.close;

  const result = exec.outBinds?.ret as FileBlobs["BLOB_DATA"] | undefined;

  return result;
};
