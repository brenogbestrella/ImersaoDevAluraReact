import React from "react"
import nookies from "nookies"
import jwt from "jsonwebtoken"
import MainGrid from '../src/components/MainGrid'
import Box from "../src/components/Box"
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet } from "../src/lib/NeworkutCommons"
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations'

function ProfileSidebar(propriedades) {
  return (
    <Box as="aside">
      <img src={`https://github.com/${propriedades.gitHubUser}.png`} style= {{ borderRadius: "8px" }} />
      <hr />

      <p>
        <a className="boxLink" href={`https://github.com/${propriedades.gitHubUser}`}>
          @{propriedades.gitHubUser}
        </a>
      </p>
      <hr />

      <AlurakutProfileSidebarMenuDefault />
    </Box>
  )
}

function ProfileRelationsBox(propriedades) {
  return(
    <ProfileRelationsBoxWrapper>
             <h2 className="smallTitle">
              {propriedades.title} ({propriedades.items.length})
            </h2>
    </ProfileRelationsBoxWrapper>
  )
}

export default function Home(props) {
  const gitHubUser = props.githubUser;
  const [comunidades, setComunidades] = React.useState([]);

  
  const pessoasFavoritas = [
    "vensller", 
    "nymalone", 
    "felipilef", 
    "snxl", 
    "PrangeGabriel", 
    "Thiago-cez",
  ]

  const [seguidores, setSeguidores] = React.useState([])

  React.useEffect(function() {
    fetch(`https://api.github.com/users/${gitHubUser}/followers`)
    .then(function (respostaDoServidor) {
      return respostaDoServidor.json();
    })
    .then(function(respostaCompleta) {
      setSeguidores(respostaCompleta)
    })

    fetch("https://graphql.datocms.com/", {
      method: "POST",
      headers: {
        "Authorization": "3e2435964a54e2e4c51df86cea41d6",
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ "query": `query {
        allCommunities {
          title
          id
          imageUrl
          creatorSlug
        }
      }`})
    })
    .then((response) => response.json())
    .then((respostaCompleta) => {
      const comunidadesVindasDoDato = respostaCompleta.data.allCommunities;
      setComunidades(comunidadesVindasDoDato)
    })
  }, [])

  return (
    <>
      <AlurakutMenu />
      <MainGrid>
        <div className="profileArea" style={{ gridArea: 'profileArea' }}>
          <ProfileSidebar gitHubUser={gitHubUser} />
        </div>
        <div className="welcomeArea" style={{ gridArea: 'welcomeArea' }}>
          <Box>
            <h1 className="title">
              Bem vindo(a)
            </h1>

            <OrkutNostalgicIconSet />
          </Box>

          <Box>
            <h2 className="subTitle">O que você deseja fazer?</h2>
            <form onSubmit={function handleCriaComunidade(e) {
              e.preventDefault();

              const dadosDoForm = new FormData(e.target);

              const comunidade = {
                title: dadosDoForm.get("title"),
                imageUrl: dadosDoForm.get("image"),
                creatorSlug: gitHubUser,
              }

              fetch("/api/comunidades", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(comunidade)
              })
              .then(async (res) => {
                const dados = await res.json();
                const comunidade = dados.registroCriado;
                setComunidades([...comunidades , comunidade])
              })

            }}>
              <div>
                <input 
                  placeholder="Qual vai ser o nome da sua comunidade?" 
                  name="title" 
                  aria-label="Qual vai ser o nome da sua comunidade?"
                  type="text" 
                />
              </div>
              <div>
                <input 
                  placeholder="Coloque uma URL para usarmos de capa" 
                  name="image" 
                  aria-label="Coloque uma URL para usarmos de capa" 
                  />
              </div>

              <button>
                Criar comunidade
              </button>
            </form>
          </Box>
        </div>
        <div className="profileRelationsArea" style={{ gridArea: 'profileRelationsArea' }}>
        <ProfileRelationsBox title="Seguidores" items={seguidores} />
        <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Amigos ({pessoasFavoritas.length})
            </h2>
            <ul>
            {pessoasFavoritas.map((itemAtual) => {
              return (
                <li key={itemAtual}>
                  <a href={`/users/${itemAtual}`}>
                    <img src={`https://github.com/${itemAtual}.png`} />
                    <span>{itemAtual}</span> 
                  </a>
                </li>
                
              )
            })}
            </ul>
          </ProfileRelationsBoxWrapper>
        <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Comunidades ({comunidades.length})
            </h2>
          <ul>
            {comunidades.map((itemAtual) => {
              return (
                <li key={itemAtual.id}>
                  <a href={`/communities/${itemAtual.id}`}>
                    <img src={itemAtual.imageUrl} />
                    <span>{itemAtual.title}</span> 
                  </a>
                </li>
              )
            })}
          </ul>
        </ProfileRelationsBoxWrapper>
          
        </div>
      </MainGrid>
    </>
    )
}

export async function getServerSideProps(context) {
  const cookies = nookies.get(context)
  const token = cookies.USER_TOKEN
  const decodedToken = jwt.decode(token);
  const githubUser = decodedToken?.githubUser

  if(!githubUser) {
    return { 
      redirect: {
        destination: "/login",
        permanent: false
      }
    }
  }

  return {
    props: {
      githubUser
    }
  }
}
