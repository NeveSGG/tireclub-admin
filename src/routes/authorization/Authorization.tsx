import React, { FC } from 'react';
import SignIn from 'components/signIn';
import SignUp from 'components/signUp';

interface IAuthorization {
  type: 'signIn' | 'signUp';
}

const Authorization: FC<IAuthorization> = ({ type }) => {
  switch (type) {
    case 'signIn': {
      return <SignIn />;
    }
    case 'signUp': {
      return <SignUp />;
    }
    default: {
      return null;
    }
  }
};

export default Authorization;
