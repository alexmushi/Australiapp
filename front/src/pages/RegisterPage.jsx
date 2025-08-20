// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext.jsx';
// import AuthCard from '../components/auth/AuthCard.jsx';
// import CustomInput from '../components/CustomInput.jsx';
// import CustomSelect from '../components/CustomSelect.jsx';
// import CustomButton from '../components/CustomButton.jsx';
// import AuthCardError from '../components/auth/AuthCardError.jsx';
// import { FaUser, FaLock, FaMoneyBill } from 'react-icons/fa';
// import useCurrencies from '../hooks/useCurrencies.js';

// export default function RegisterPage({ onSwitch }) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const currencies = useCurrencies();
//   const [currency, setCurrency] = useState('');

//   React.useEffect(() => {
//    if (!currency && currencies.length > 0) {
//      setCurrency(currencies[0]);
//    }
//  }, [currencies]);
//   const { register } = useAuth();
//   const [error, setError] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     if (!username || !password || !currency) {
//       setError('Completa todos los campos.');
//       return;
//     }
//     try {
//       await register({ username, password, default_currency_code: currency });
//     } catch (err) {
//       console.error(err);
//       setError('Registration failed');
//     }
//   };

//   return (
//     <AuthCard title='Registro' description='Crea tu cuenta para comenzar' showBackButton onBack={onSwitch}>
//       {error && <AuthCardError>{error}</AuthCardError>}
//       <form onSubmit={handleSubmit} noValidate>
//         <CustomInput
//           name='username'
//           id='reg-username'
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           placeholder='Nombre de usuario'
//           icon={<FaUser />}
//           required
//         >
//           Usuario
//         </CustomInput>
//         <CustomInput
//           name='password'
//           id='reg-password'
//           type='password'
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder='******'
//           icon={<FaLock />}
//           required
//         >
//           Contraseña
//         </CustomInput>
//         <CustomSelect
//           name='currency'
//           id='reg-currency'
//           value={currency}
//           onChange={(e) => setCurrency(e.target.value)}
//           options={currencies}
//           icon={<FaMoneyBill />}
//           required
//         >
//           Moneda predeterminada
//         </CustomSelect>
//         <CustomButton type='submit' isPrimary>
//           Registrarse
//         </CustomButton>
//       </form>
//     </AuthCard>
//   );
// }