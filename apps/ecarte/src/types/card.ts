export interface StudentCard {
  id: string;
  cne: string;
  apogee: string;
  filiere: string;
  etablissement: string;
  photoUrl: string | null;
  cardActive: boolean;
  user: {
    email: string;
    name: string;
  };
  anneeInscription: string;
}

export interface QRToken {
  token: string;
}

export type CardState = 
  | 'loading'
  | 'active'
  | 'offline'
  | 'suspended'
  | 'outOfHours'
  | 'error';
