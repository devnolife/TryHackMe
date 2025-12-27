import axios from 'axios';

const GRAPHQL_ENDPOINT = 'https://sicekcok.if.unismuh.ac.id/graphql';

export interface MahasiswaUser {
  nim: string;
  nama: string;
  hp: string | null;
  email: string | null;
  prodi: string;
  foto: string;
  passwd: string;
}

/**
 * Query MahasiswaUser from external GraphQL API by NIM
 */
export async function getMahasiswaByNim(nim: string): Promise<MahasiswaUser | null> {
  try {
    const query = `
      query GetMahasiswaByNim($nim: String!) {
        mahasiswaUser(nim: $nim) {
          nim
          nama
          hp
          email
          prodi
          foto
          passwd
        }
      }
    `;

    const response = await axios.post(
      GRAPHQL_ENDPOINT,
      {
        query,
        variables: { nim },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (response.data.errors) {
      console.error('GraphQL errors:', response.data.errors);
      return null;
    }

    return response.data.data?.mahasiswaUser || null;
  } catch (error) {
    console.error('Error fetching mahasiswa data:', error);
    return null;
  }
}

/**
 * Query all MahasiswaUser data (use with caution)
 */
export async function getAllMahasiswa(): Promise<MahasiswaUser[]> {
  try {
    const query = `
      query {
        MahasiswaUser {
          nim
          nama
          hp
          email
          prodi
          foto
          passwd
        }
      }
    `;

    const response = await axios.post(
      GRAPHQL_ENDPOINT,
      { query },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    if (response.data.errors) {
      console.error('GraphQL errors:', response.data.errors);
      return [];
    }

    return response.data.data?.MahasiswaUser || [];
  } catch (error) {
    console.error('Error fetching all mahasiswa data:', error);
    return [];
  }
}
