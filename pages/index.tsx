import type { NextPage } from 'next'
import { FormEvent, useContext, useState } from 'react'
import { AuthContext } from '../context/Auth.Context'
import styles from '../styles/Home.module.css'
import { WithSSR } from '../utils/withSSRGuest'

const Home: NextPage = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { signIn } = useContext(AuthContext)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const data = {
      email,
      password
    }

    await signIn(data);
  }

  return (<div className={styles.container}>
    <h1 className={styles.login}>Login</h1>

    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit"  >Entrar</button>
    </form>
  </div>
  )
}
export default Home



export const getServerSideProps = WithSSR (async (ctx) => {

  return {
    props: {
      
    }
  }


});
