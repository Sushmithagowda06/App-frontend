import React, {createContext, useState, ReactNode} from 'react';

type User = {
  name: string;
  phone: string;
  membership: boolean;
};

type UserContextType = {
  user: User;
  setUser: (u: User) => void;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User>({
    name: 'Manu Amidal',
    phone: '+91 7975609828',
    membership: false,
  });

  return (
    <UserContext.Provider value={{user, setUser}}>
      {children}
    </UserContext.Provider>
  );
}
