import { DailyHistoryItem } from '../types';

export const SPREADSHEET_TITLE = 'HabitFlow Weekly Productivity Logs';

export interface UserProfileInfo {
  name: string;
  email: string;
  photoUrl: string;
}

/**
 * Searches for a spreadsheet in Drive with title "HabitFlow Weekly Productivity Logs".
 * If not found, creates a new one.
 */
export async function getOrCreateSpreadsheet(accessToken: string): Promise<string> {
  try {
    // 1. Search Google Drive
    const query = `name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`;
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!searchResponse.ok) {
      throw new Error(`Gagal mencari file di Drive: ${searchResponse.statusText}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }
    
    // 2. Create if not found
    const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: SPREADSHEET_TITLE
        }
      })
    });
    
    if (!createResponse.ok) {
      throw new Error(`Gagal membuat Spreadsheet baru: ${createResponse.statusText}`);
    }
    
    const createData = await createResponse.json();
    return createData.spreadsheetId;
  } catch (error) {
    console.error('Error in getOrCreateSpreadsheet:', error);
    throw error;
  }
}

/**
 * Exports history array directly to Google Sheets
 */
export async function exportHistoryToSheets(
  accessToken: string,
  spreadsheetId: string,
  history: DailyHistoryItem[]
): Promise<void> {
  try {
    // We overwrite Sheet1!A1:I50 to replace old data with up to date history list
    const range = 'Sheet1!A1:I50';
    const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
    
    const rows = [
      [
        'Rentang Tanggal',
        'Label Pekan',
        'Habit Wajib Selesai',
        'Total Habit Wajib',
        'Habit Pilihan Selesai',
        'Total Habit Pilihan',
        'Tugas Selesai',
        'Total Tugas',
        'Poin XP Diperoleh'
      ],
      ...history.map(item => [
        item.date,
        item.dayName,
        item.primaryCompleted,
        item.primaryTotal,
        item.secondaryCompleted,
        item.secondaryTotal,
        item.tasksCompleted,
        item.tasksTotal,
        item.pointsEarned
      ])
    ];

    // Ensure we send clear-out payload if history is empty (just headers)
    const bodyPayload = {
      range,
      majorDimension: 'ROWS',
      values: rows
    };

    // First clear old cells in that range so deleted rows disappear
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:clear`;
    await fetch(clearUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const response = await fetch(writeUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyPayload)
    });

    if (!response.ok) {
      throw new Error(`Gagal memperbarui data baris: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error in exportHistoryToSheets:', error);
    throw error;
  }
}

/**
 * Imports history data back from the Google Spreadsheet
 */
export async function importHistoryFromSheets(
  accessToken: string,
  spreadsheetId: string
): Promise<DailyHistoryItem[]> {
  try {
    const range = 'Sheet1!A2:I50'; // skip row 1 headers
    const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
    
    const response = await fetch(readUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!response.ok) {
      throw new Error(`Gagal mengimpor dari Sheets: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.values || data.values.length === 0) {
      return [];
    }
    
    return data.values.map((row: any[]) => ({
      date: row[0] || '',
      dayName: row[1] || '',
      primaryCompleted: Number(row[2]) || 0,
      primaryTotal: Number(row[3]) || 0,
      secondaryCompleted: Number(row[4]) || 0,
      secondaryTotal: Number(row[5]) || 0,
      tasksCompleted: Number(row[6]) || 0,
      tasksTotal: Number(row[7]) || 0,
      pointsEarned: Number(row[8]) || 0
    }));
  } catch (error) {
    console.error('Error in importHistoryFromSheets:', error);
    throw error;
  }
}

/**
 * Fetches current logged-in user profile from Google Profile API
 */
export async function fetchUserInfo(accessToken: string): Promise<UserProfileInfo> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) {
      throw new Error(`Gagal mendapatkan profil pengguna: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      name: data.name || 'Pengguna Google',
      email: data.email || '',
      photoUrl: data.picture || ''
    };
  } catch (err) {
    console.error('Error fetching user info:', err);
    return {
      name: 'Pengguna Google',
      email: '',
      photoUrl: ''
    };
  }
}
