// pega os elementos html que a gente vai usar
const containerPokemons = document.querySelector("#containerPokemons");
const modalPokemon = document.querySelector("#modalPokemon");
const botaoFecharModal = document.querySelector("#botaoFecharModal");
const infoModal = document.querySelector("#infoModal");
const botaoPokebola = document.getElementById('botaoPokebola');
const menuCompleto = document.getElementById('menuCompleto');
const containerBotoesMenu = document.getElementById('containerBotoesMenu');
const iconeLupa = document.querySelector('.icone-lupa');
const containerBarraBusca = document.getElementById('containerBarraBusca');
const inputBuscaPokemon = document.getElementById('inputBuscaPokemon');
const containerCabecalho = document.querySelector('.container-cabecalho');
const botaoVoltarAoTopo = document.getElementById('botaoVoltarAoTopo');
const overlayCarregamento = document.getElementById('overlayCarregamento');

// um objeto com as cores pra cada tipo de pokémon
const cores = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  grass: '#7AC74C',
  electric: '#F7D02C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  steel: '#B7B7CE',
  dark: '#705746',
  fairy: '#D685AD',
};

// pega as chaves do objeto cores, que são os tipos principais
const tiposPrincipais = Object.keys(cores);

// caminhos das imagens de estrela e textos alternativos
const IMAGEM_ESTRELA_PREENCHIDA = 'assets/star-filled.png';
const IMAGEM_ESTRELA_VAZIA = 'assets/star-empty.png';
const ALT_FAVORITO = 'Favorito';
const ALT_NAO_FAVORITO = 'Não Favorito';

// variáveis de estado pra guardar os dados dos pokémons e filtros
let todosPokemons = [];
let listaPokemonBruta = [];
let pokemonsFavoritos = JSON.parse(localStorage.getItem('pokemonsFavoritos')) || [];
let filtroAtivo = { valor: "Todos", tipo: null };
let ordenacaoAtiva = "id_asc";
let pokemonsGeracaoAtual = [];

// listas pra preencher os menus dinamicamente
let todasGeracoes = [];
let todosElementos = [];
const itensMenuPrincipal = ["Todos", "Favoritos", "Gerações", "Elementos", "Ordenar por...", "Estágio Evolutivo", "Resetar Filtros"];
const itensMenuEstagio = ["Estágio Inicial", "Estágio Intermediário", "Estágio Final", "Estágio Único"];
const itensMenuOrdenacao = {
  "ID (Padrão)": "id_asc",
  "Nome (A-Z)": "name_asc",
  "Nome (Z-A)": "name_desc",
  "Altura (Maior)": "height_desc",
  "Altura (Menor)": "height_asc",
  "Peso (Mais Pesado)": "weight_desc",
  "Peso (Mais Leve)": "weight_asc"
};

// quando clica no botão, a página volta pro topo suavemente
botaoVoltarAoTopo.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// mostra ou esconde o botão "voltar ao topo" dependendo de onde a gente tá na página
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    botaoVoltarAoTopo.classList.remove('hidden');
  } else {
    botaoVoltarAoTopo.classList.add('hidden');
  }
});

// salva a lista de favoritos no armazenamento local do navegador
const salvarFavoritos = () => {
  localStorage.setItem('pokemonsFavoritos', JSON.stringify(pokemonsFavoritos));
};

// verifica se um pokémon tá na lista de favoritos
const ehFavorito = (idPokemon) => {
  return pokemonsFavoritos.includes(idPokemon);
};

// adiciona ou remove um pokémon dos favoritos e atualiza a interface
const alternarFavorito = (idPokemon, event) => {
  event.stopPropagation();
  const pokemonEstaFavorito = ehFavorito(idPokemon);
  if (pokemonEstaFavorito) {
    pokemonsFavoritos = pokemonsFavoritos.filter(id => id !== idPokemon);
  } else {
    pokemonsFavoritos.push(idPokemon);
  }
  salvarFavoritos();

  const novoEstadoFavorito = !pokemonEstaFavorito;
  const novaImgSrc = novoEstadoFavorito ? IMAGEM_ESTRELA_PREENCHIDA : IMAGEM_ESTRELA_VAZIA;
  const novoAltText = novoEstadoFavorito ? ALT_FAVORITO : ALT_NAO_FAVORITO;

  const cardNoGrid = containerPokemons.querySelector(`.pokemon[data-id-pokemon="${idPokemon}"]`);

  if (filtroAtivo.valor === "Favoritos" && !novoEstadoFavorito) {
    if (cardNoGrid) {
      cardNoGrid.remove();
    }
    if (containerPokemons.children.length === 0) {
      containerPokemons.innerHTML = `<p style="color:white; font-size: 1.2rem; text-align: center;">Nenhum Pokémon favorito encontrado.</p>`;
    }
  } else {
    if (cardNoGrid) {
      const iconeEstrela = cardNoGrid.querySelector('.icone-estrela-favorito');
      if (iconeEstrela) {
        iconeEstrela.src = novaImgSrc;
        iconeEstrela.alt = novoAltText;
      }
    }
  }

  if (!modalPokemon.classList.contains('hidden') && infoModal.dataset.idPokemon == idPokemon) {
    const iconeEstrelaModal = infoModal.querySelector('.icone-favorito-modal');
    if (iconeEstrelaModal) {
      iconeEstrelaModal.src = novaImgSrc;
      iconeEstrelaModal.alt = novoAltText;
    }
  }
};

// converte altura/peso de decímetros/hectogramas para metros/kg
const parseEstatistica = (valorEstatistica) => {
    const valorNumerico = parseFloat(valorEstatistica);
    return isNaN(valorNumerico) ? 0 : valorNumerico / 10;
};

// busca a descrição de um pokémon em inglês
const getDescricaoPokemon = async (urlEspecie) => {
    try {
        const response = await fetch(urlEspecie);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const dadosEspecie = await response.json();
        const entradaTextoSabor = dadosEspecie.flavor_text_entries.find(entry => entry.language.name === 'en');
        return entradaTextoSabor ? entradaTextoSabor.flavor_text.replace(/[\n\f]/g, ' ') : 'Sem descrição disponível.';
    } catch (error) {
        console.error("Erro ao buscar descrição:", error);
        return 'Sem descrição disponível.';
    }
};

// busca a cadeia evolutiva de um pokémon
const getCadeiaEvolutiva = async (urlCadeiaEvolutiva) => {
    try {
        const response = await fetch(urlCadeiaEvolutiva);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const dadosCadeia = await response.json();

        const evolucoes = [];
        let evolucaoAtual = dadosCadeia.chain;

        while (evolucaoAtual) {
            const partesUrlEspecie = evolucaoAtual.species.url.split('/');
            const id = partesUrlEspecie[partesUrlEspecie.length - 2];
            evolucoes.push(id);
            evolucaoAtual = evolucaoAtual.evolves_to[0];
        }
        return evolucoes;
    } catch (error) {
        console.error("Erro ao buscar cadeia evolutiva:", error);
        return [];
    }
};

// busca todos os dados de um pokémon (id, nome, tipos, altura, peso, descrição, geração e evolução)
const buscarDadosPokemon = async (urlPokemon) => {
    try {
        const response = await fetch(urlPokemon);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const dados = await response.json();

        const id = String(dados.id).padStart(3, '0');
        const nome = dados.name.charAt(0).toUpperCase() + dados.name.slice(1);
        const tipos = dados.types.map(infoTipo => infoTipo.type.name);
        const tipoPrimario = tipos[0];

        const respostaEspecie = await fetch(dados.species.url);
        const dadosEspecie = await respostaEspecie.json();
        const descricao = await getDescricaoPokemon(dados.species.url);

        let geracao = 1;
        if (dadosEspecie.generation && dadosEspecie.generation.url) {
            const match = dadosEspecie.generation.url.match(/generation\/(\d+)\//);
            if (match && match[1]) {
                geracao = parseInt(match[1]);
            } else {
                console.warn(`url de geração inválida para ${nome} (id: ${id}): ${dadosEspecie.generation.url}. usando geração 1.`);
            }
        } else {
        }

        const idsCadeiaEvolutiva = await getCadeiaEvolutiva(dadosEspecie.evolution_chain.url);

        return {
            id: id,
            nome: nome,
            estilo: tipos.join('/'),
            tipoPrimario: tipoPrimario,
            infos: {
                altura: `${parseEstatistica(dados.height)}m`,
                peso: `${parseEstatistica(dados.weight)}kg`,
                geracao: geracao
            },
            descricao: descricao,
            evolucoes: idsCadeiaEvolutiva
        };
    } catch (error) {
        console.error(`erro ao buscar dados para ${urlPokemon}:`, error);
        return null;
    }
};

// filtra a lista de pokémons com base no filtro ativo
const getPokemonsFiltrados = () => {
  const { valor, tipo } = filtroAtivo;
  let listaFiltrada = pokemonsGeracaoAtual.length > 0 ? pokemonsGeracaoAtual : todosPokemons;

  if (valor === "Todos") {
    return listaFiltrada;
  }
  if (valor === "Favoritos") {
    return listaFiltrada.filter(poke => ehFavorito(poke.id));
  }
  if (tipo === "gen") {
    const numeroGeracao = parseInt(valor.split(' ')[1]);
    return listaFiltrada.filter(poke => poke.infos.geracao === numeroGeracao);
  }
  if (tipo === "element") {
    const tipoElemento = valor.toLowerCase();
    return listaFiltrada.filter(poke => poke.estilo.split('/').includes(tipoElemento));
  }
  if (tipo === "stage") {
    if (valor === "Estágio Inicial") {
      return listaFiltrada.filter(p => p.id === p.evolucoes[0] && p.evolucoes.length > 1);
    }
    if (valor === "Estágio Intermediário") {
      return listaFiltrada.filter(p => p.evolucoes.length > 1 && p.id !== p.evolucoes[0] && p.id !== p.evolucoes[p.evolucoes.length - 1]);
    }
    if (valor === "Estágio Final") {
      return listaFiltrada.filter(p => p.id === p.evolucoes[p.evolucoes.length - 1] && p.evolucoes.length > 1);
    }
    if (valor === "Estágio Único") {
      return listaFiltrada.filter(p => p.evolucoes.length === 1);
    }
  }

  console.warn(`filtro "${valor}" não implementado ainda.`);
  return listaFiltrada;
};

// aplica a ordenação selecionada à lista de pokémons
const aplicarOrdenacao = (arrayPokemon) => {
  const arrayOrdenado = [...arrayPokemon];

  switch (ordenacaoAtiva) {
    case "id_asc":
      return arrayOrdenado.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    case "name_asc":
      return arrayOrdenado.sort((a, b) => a.nome.localeCompare(b.nome));
    case "name_desc":
      return arrayOrdenado.sort((a, b) => b.nome.localeCompare(a.nome));
    case "height_desc":
      return arrayOrdenado.sort((a, b) => parseEstatistica(b.infos.altura.replace('m', '')) - parseEstatistica(a.infos.altura.replace('m', '')));
    case "height_asc":
      return arrayOrdenado.sort((a, b) => parseEstatistica(a.infos.altura.replace('m', '')) - parseEstatistica(b.infos.altura.replace('m', '')));
    case "weight_desc":
      return arrayOrdenado.sort((a, b) => parseEstatistica(b.infos.peso.replace('kg', '')) - parseEstatistica(a.infos.peso.replace('kg', '')));
    case "weight_asc":
      return arrayOrdenado.sort((a, b) => parseEstatistica(a.infos.peso.replace('kg', '')) - parseEstatistica(b.infos.peso.replace('kg', '')));
    default:
      return arrayOrdenado;
  }
};

// (atualiza a exibição dos pokémons na tela aplicando filtros e ordenação)
const atualizarExibicao = () => {
  const listaFiltrada = getPokemonsFiltrados();
  const listaOrdenada = aplicarOrdenacao(listaFiltrada);
  renderizarPokemons(listaOrdenada);
};

// renderiza os cards dos pokémons na tela
const renderizarPokemons = (arrayPokemon) => {
  containerPokemons.innerHTML = '';

  if (arrayPokemon.length > 0) {
    arrayPokemon.forEach(pokemon => criarCardPokemon(pokemon));
  } else {
    const mensagem = filtroAtivo.valor === "Favoritos" ?
      'nenhum pokémon favorito encontrado.' :
      `nenhum pokémon encontrado para "${filtroAtivo.valor}".`;
    containerPokemons.innerHTML = `<p style="color:white; font-size: 1.2rem; text-align: center;">${mensagem}</p>`;
  }
};

// busca todas as gerações de pokémons da api
const buscarECarregarGeracoes = async () => {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/generation/');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        todasGeracoes = data.results.map(gen => {
            const match = gen.url.match(/generation\/(\d+)\//);
            if (match && match[1]) {
                return parseInt(match[1]);
            }
            console.warn(`url de geração inválida na lista de gerações: ${gen.url}. ignorando.`);
            return NaN;
        }).filter(gen => !isNaN(gen));
        todasGeracoes.sort((a, b) => a - b);
    } catch (error) {
        console.error("erro ao buscar gerações:", error);
    }
};

// busca todos os tipos (elementos) de pokémons da api
const buscarECarregarElementos = async () => {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/type/');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        todosElementos = data.results
            .filter(type => !['unknown', 'shadow'].includes(type.name))
            .map(type => type.name.charAt(0).toUpperCase() + type.name.slice(1));
        todosElementos.sort((a, b) => a.localeCompare(b));
    } catch (error) {
        console.error("erro ao buscar elementos (tipos):", error);
    }
};

// mostra o overlay de carregamento
const mostrarCarregamento = () => {
    overlayCarregamento.classList.remove('hidden');
    document.body.classList.add('carregando');
};

// esconde o overlay de carregamento
const esconderCarregamento = () => {
    overlayCarregamento.classList.add('hidden');
    document.body.classList.remove('carregando');
};

// carrega todos os dados de pokémons da api
const carregarTodosDadosPokemon = async (url = 'https://pokeapi.co/api/v2/pokemon?limit=1000') => {
    mostrarCarregamento();
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        listaPokemonBruta = data.results;

        const promessasPokemon = listaPokemonBruta.map(item => buscarDadosPokemon(item.url));
        const pokemonsResolvidos = await Promise.all(promessasPokemon);
        todosPokemons = pokemonsResolvidos.filter(p => p !== null);

        pokemonsGeracaoAtual = todosPokemons;

        atualizarExibicao();
    } catch (error) {
        console.error("erro ao carregar todos os dados de pokémon:", error);
        containerPokemons.innerHTML = "<p>erro ao carregar os dados. verifique o console.</p>";
    } finally {
        esconderCarregamento();
    }
};

// carrega os cards de pokémons de uma geração específica
const carregarCardsPokemonPorGeracao = async (numeroGeracao) => {
    mostrarCarregamento();
    containerPokemons.innerHTML = `<p style="color:white; font-size: 1.2rem; text-align: center;">carregando pokémons da geração ${numeroGeracao}...</p>`;
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/generation/${numeroGeracao}/`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const dadosGeracao = await response.json();

        const urlsEspeciesPokemon = dadosGeracao.pokemon_species.map(species => species.url);
        const promessasPokemon = urlsEspeciesPokemon.map(async urlEspecie => {
            const respostaEspecie = await fetch(urlEspecie);
            const jsonEspecie = await respostaEspecie.json();
            const variedadePadrao = jsonEspecie.varieties.find(v => v.is_default);
            if (variedadePadrao) {
                const urlPokemon = variedadePadrao.pokemon.url;
                return buscarDadosPokemon(urlPokemon);
            }
            console.warn(`nenhuma variedade padrão encontrada para a espécie: ${urlEspecie}`);
            return null;
        });

        const pokemonsResolvidos = await Promise.all(promessasPokemon);
        pokemonsGeracaoAtual = pokemonsResolvidos.filter(p => p !== null);
        atualizarExibicao();

    } catch (error) {
        console.error(`erro ao carregar pokémon para a geração ${numeroGeracao}:`, error);
        containerPokemons.innerHTML = "<p>erro ao carregar os dados da geração.</p>";
    } finally {
        esconderCarregamento();
    }
};

// cria um card de pokémon na tela
const criarCardPokemon = (poke) => {
  const card = document.createElement('div');
  card.classList.add("pokemon");
  card.dataset.idPokemon = poke.id;

  const nome = poke.nome;
  const id = poke.id;
  const idNumerico = parseInt(id, 10);
  const tiposPokemon = poke.estilo.split('/');

  const tipoPrimario = poke.tipoPrimario;
  const cor = cores[tipoPrimario] || '#ccc';
  card.style.backgroundColor = cor;

  const ehFavoritoPokemon = ehFavorito(poke.id);
  const imagemEstrelaFavorito = ehFavoritoPokemon ? IMAGEM_ESTRELA_PREENCHIDA : IMAGEM_ESTRELA_VAZIA;
  const altEstrelaFavorito = ehFavoritoPokemon ? ALT_FAVORITO : ALT_NAO_FAVORITO;

  const innerHTMLPokemon = `
    <div class="container-icone-favorito" data-id-pokemon="${poke.id}">
        <img src="${imagemEstrelaFavorito}" alt="${altEstrelaFavorito}" class="icone-estrela-favorito">
    </div>
    <div class="container-imagem">
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${idNumerico}.png" alt="${nome}">
    </div>
    <div class="info">
      <span class="numero">#${id}</span>
      <h3 class="nome">${nome}</h3>
      <small class="tipo">Tipo:<span>${tiposPokemon.join(' / ')}</span></small>
    </div>
  `;

  card.innerHTML = innerHTMLPokemon;
  containerPokemons.appendChild(card);
}

// mostra o modal com detalhes do pokémon
const mostrarModalPokemon = (pokemon) => {
  const idPokemonAtual = pokemon.id;
  const idNumerico = parseInt(pokemon.id, 10);
  const tiposPokemon = pokemon.estilo.split('/');
  const tipoPrimario = pokemon.tipoPrimario;
  const cor = cores[tipoPrimario] || '#ccc';
  const corFundoModal = '#333';

  const imagensEvolucoes = pokemon.evolucoes.map(idEvolucao => {
    const idNumericoEvolucao = parseInt(idEvolucao, 10);
    return `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${idNumericoEvolucao}.png" alt="evolution ${idEvolucao}" class="imagem-evolucao" data-id-pokemon="${idEvolucao}">`;
  }).join(' <span class="seta-evolucao">></span> ');

  const ehFavoritoPokemon = ehFavorito(pokemon.id);
  const imagemEstrelaFavoritoModal = ehFavoritoPokemon ? IMAGEM_ESTRELA_PREENCHIDA : IMAGEM_ESTRELA_VAZIA;
  const altEstrelaFavoritoModal = ehFavoritoPokemon ? ALT_FAVORITO : ALT_NAO_FAVORITO;

  infoModal.dataset.idPokemon = pokemon.id;

  infoModal.innerHTML = `
    <div class="container-favorito-modal" data-id-pokemon="${pokemon.id}">
        <img src="${imagemEstrelaFavoritoModal}" alt="${altEstrelaFavoritoModal}" class="icone-favorito-modal">
    </div>
    <div class="cabecalho-modal">
      <div class="container-imagem-modal">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${idNumerico}.png" alt="${pokemon.nome}">
      </div>
      <div class="info-titulo-modal">
        <h2 class="nome-modal" style="color: ${cor};">${pokemon.nome}</h2>
        <small class="tipo-modal">Tipo:<span>${tiposPokemon.join(' / ')}</span></small>
        <span class="numero-modal">#${pokemon.id}</span>
      </div>
    </div>
    <div class="detalhes-modal">
      <div class="estatisticas-modal">
        <h3>infos</h3>
        <p>altura: ${pokemon.infos.altura}</p>
        <p>peso: ${pokemon.infos.peso}</p>
        <p>geração: ${pokemon.infos.geracao}</p>
      </div>
      <div class="descricao-modal">
        <h3>descrição</h3>
        <p>${pokemon.descricao}</p>
      </div>
    </div>
    <div class="evolucoes-modal">
      <h3>evoluções</h3>
      <div class="cadeia-evolutiva">
        ${imagensEvolucoes}
      </div>
    </div>
  `;

  const containerImagemModal = infoModal.querySelector('.container-imagem-modal');
  if (containerImagemModal) {
    containerImagemModal.style.background = `linear-gradient(0deg, ${cor} -100%, ${corFundoModal} 100%)`;
  }
  const imagensEvolucao = infoModal.querySelectorAll('.imagem-evolucao');
  if (imagensEvolucao.length > 0) {
    imagensEvolucao.forEach(img => {
      img.style.background = `linear-gradient(0deg, ${cor} -100%, ${corFundoModal} 100%)`;
    });
  }

  modalPokemon.classList.remove('hidden');

  const containerFavoritoModal = infoModal.querySelector('.container-favorito-modal');
  if (containerFavoritoModal) {
    const novoContainerFav = containerFavoritoModal.cloneNode(true);
    containerFavoritoModal.replaceWith(novoContainerFav);
    novoContainerFav.addEventListener('click', (event) => alternarFavorito(pokemon.id, event));
  }

  const containerCadeiaEvolutiva = infoModal.querySelector('.cadeia-evolutiva');
  if (containerCadeiaEvolutiva) {
     const novaCadeiaEvolutiva = containerCadeiaEvolutiva.cloneNode(true);
     containerCadeiaEvolutiva.replaceWith(novaCadeiaEvolutiva);
     novaCadeiaEvolutiva.addEventListener('click', async (event) => {
      const imagemClicada = event.target.closest('.imagem-evolucao');
      if (imagemClicada) {
        const idPokemonClicado = imagemClicada.dataset.idPokemon;

        if (idPokemonClicado && idPokemonClicado !== idPokemonAtual) {
          const proximoPokemon = todosPokemons.find(p => p.id === idPokemonClicado) || pokemonsGeracaoAtual.find(p => p.id === idPokemonClicado);
          if (!proximoPokemon) {
            const pokeBruto = listaPokemonBruta.find(p => p.url.includes(`/${parseInt(idPokemonClicado)}/`));
            if (pokeBruto) {
                const proximoPokemonBuscado = await buscarDadosPokemon(pokeBruto.url);
                if (proximoPokemonBuscado) {
                    todosPokemons.push(proximoPokemonBuscado);
                    mostrarModalPokemon(proximoPokemonBuscado);
                }
            } else {
                console.error(`pokémon com id ${idPokemonClicado} não encontrado na lista bruta.`);
            }
          } else {
            mostrarModalPokemon(proximoPokemon);
          }
        }
      }
    });
  }
};

// renderiza os botões do menu com base nos itens e tipo
const renderizarBotoesMenu = (itens, tipo) => {
  containerBotoesMenu.innerHTML = '';

  if (tipo !== 'main') {
    containerBotoesMenu.innerHTML = '<button class="botao-menu" data-type="back">voltar</button>';
  }

  itens.forEach(item => {
    const button = document.createElement('button');
    button.classList.add('botao-menu');
    button.dataset.type = tipo;

    if (tipo === 'gen') {
      button.innerText = `geração ${item}`;
      button.dataset.value = `geração ${item}`;
    } else {
      button.innerText = item;
      button.dataset.value = item;
    }
    containerBotoesMenu.appendChild(button);
  });
};

// mostra o menu principal
const mostrarMenuPrincipal = () => {
  renderizarBotoesMenu(itensMenuPrincipal, 'main');
};
// mostra os filtros de geração
const mostrarFiltrosGeracao = () => {
  renderizarBotoesMenu(todasGeracoes, 'gen');
};
// mostra os filtros de elemento
const mostrarFiltrosElemento = () => {
  renderizarBotoesMenu(todosElementos, 'element');
};
// mostra os filtros de estágio evolutivo
const mostrarFiltrosEstagio = () => {
  renderizarBotoesMenu(itensMenuEstagio, 'stage');
};
// mostra os filtros de ordenação
const mostrarFiltrosOrdenacao = () => {
  renderizarBotoesMenu(Object.keys(itensMenuOrdenacao), 'sort');
};

// quando clica em um card de pokémon ou no ícone de favorito
containerPokemons.addEventListener('click', (event) => {
  const containerFavorito = event.target.closest('.container-icone-favorito');
  if (containerFavorito) {
    const idPokemon = containerFavorito.dataset.idPokemon;
    if (idPokemon) {
      alternarFavorito(idPokemon, event);
    }
    return;
  }
  const cardPokemon = event.target.closest('.pokemon');
  if (cardPokemon) {
    const idPokemon = cardPokemon.dataset.idPokemon;
    const pokemon = todosPokemons.find(p => p.id == idPokemon) || pokemonsGeracaoAtual.find(p => p.id == idPokemon);
    if (pokemon) {
      mostrarModalPokemon(pokemon);
    } else {
        console.error(`pokémon com id ${idPokemon} não encontrado nas listas atuais.`);
    }
  }
});

// quando clica na lupa, mostra ou esconde a barra de busca
iconeLupa.addEventListener('click', (event) => {
  event.stopPropagation();
  containerBarraBusca.classList.toggle('hidden');
  containerCabecalho.classList.toggle('busca-ativa');

  if (!containerBarraBusca.classList.contains('hidden')) {
    inputBuscaPokemon.focus();
  } else {
    inputBuscaPokemon.value = '';
    atualizarExibicao();
  }
});

// filtra os pokémons conforme a gente digita na barra de busca
inputBuscaPokemon.addEventListener('input', (event) => {
  const termoBusca = event.target.value.toLowerCase().trim();

  let pokemonsParaBuscar = pokemonsGeracaoAtual.length > 0 ? pokemonsGeracaoAtual : todosPokemons;

  if (termoBusca === '') {
    atualizarExibicao();
    return;
  }

  const filtrados = pokemonsParaBuscar.filter(pokemon => {
    const nomeMatch = pokemon.nome.toLowerCase().includes(termoBusca);
    const idMatch = pokemon.id.includes(termoBusca);
    return nomeMatch || idMatch;
  });

  const ordenados = aplicarOrdenacao(filtrados);

  containerPokemons.innerHTML = '';
  if (ordenados.length > 0) {
    ordenados.forEach(pokemon => criarCardPokemon(pokemon));
  } else {
    containerPokemons.innerHTML = `<p style="color:white; font-size: 1.2rem; text-align: center;">pokémon não encontrado.</p>`;
  }
});

// fecha o modal quando clica no botão de fechar
botaoFecharModal.addEventListener('click', () => {
  modalPokemon.classList.add('hidden');
});

// fecha o menu, a barra de busca ou o modal se clicar fora deles
window.addEventListener('click', (event) => {
  if (!menuCompleto.classList.contains('hidden') &&
    !menuCompleto.contains(event.target) &&
    event.target !== botaoPokebola) {
    menuCompleto.classList.add('hidden');
  }

  if (!containerBarraBusca.classList.contains('hidden') &&
    !containerBarraBusca.contains(event.target) &&
    event.target !== iconeLupa) {

    containerBarraBusca.classList.add('hidden');
    containerCabecalho.classList.remove('busca-ativa');
    inputBuscaPokemon.value = '';
    atualizarExibicao();
  }

  if (event.target === modalPokemon) {
    modalPokemon.classList.add('hidden');
  }
});

// fecha o menu, a barra de busca ou o modal se apertar esc
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!menuCompleto.classList.contains('hidden')) {
      menuCompleto.classList.add('hidden');
    }
    if (!containerBarraBusca.classList.contains('hidden')) {
      containerBarraBusca.classList.add('hidden');
      containerCabecalho.classList.remove('busca-ativa');
      inputBuscaPokemon.value = '';
      atualizarExibicao();
    }
    if (!modalPokemon.classList.contains('hidden')) {
      modalPokemon.classList.add('hidden');
    }
  }
});

// gerencia as interações do menu lateral
if (botaoPokebola && menuCompleto && containerBotoesMenu) {

  // abre ou fecha o menu lateral
  botaoPokebola.addEventListener('click', (event) => {
    event.stopPropagation();
    menuCompleto.classList.toggle('hidden');
    mostrarMenuPrincipal();
  });

  // lida com os cliques nos botões do menu
  containerBotoesMenu.addEventListener('click', async (event) => {
    event.stopPropagation();

    const botaoAlvo = event.target;
    if (!botaoAlvo.classList.contains('botao-menu')) return;

    const textoBotao = botaoAlvo.innerText;
    const tipoFiltro = botaoAlvo.dataset.type;

    if (textoBotao === "Gerações") {
      mostrarFiltrosGeracao();
      return;
    }
    if (textoBotao === "Elementos") {
      mostrarFiltrosElemento();
      return;
    }
    if (textoBotao === "Estágio Evolutivo") {
      mostrarFiltrosEstagio();
      return;
    }
    if (textoBotao === "Ordenar por...") {
      mostrarFiltrosOrdenacao();
      return;
    }
    if (tipoFiltro === "back" || textoBotao === "Voltar") {
      mostrarMenuPrincipal();
      return;
    }

    menuCompleto.classList.add('hidden');

    if (textoBotao === "Resetar Filtros") {
      filtroAtivo = { valor: "Todos", tipo: null };
      ordenacaoAtiva = "id_asc";
      pokemonsGeracaoAtual = todosPokemons;
    }
    else if (tipoFiltro === 'sort') {
      ordenacaoAtiva = itensMenuOrdenacao[textoBotao];
    } else if (tipoFiltro === 'gen') {
      filtroAtivo = { valor: textoBotao, tipo: tipoFiltro };
      const numeroGeracao = parseInt(textoBotao.split(' ')[1]);
      await carregarCardsPokemonPorGeracao(numeroGeracao);
    }
    else if (textoBotao === "Todos") {
        filtroAtivo = { valor: "Todos", tipo: null };
        pokemonsGeracaoAtual = todosPokemons;
    }
    else {
      filtroAtivo = { valor: textoBotao, tipo: tipoFiltro === 'main' ? null : tipoFiltro };
    }

    inputBuscaPokemon.value = '';
    if (containerCabecalho.classList.contains('busca-ativa')) {
        containerBarraBusca.classList.add('hidden');
        containerCabecalho.classList.remove('busca-ativa');
    }

    atualizarExibicao();
  });
}

// inicia o carregamento dos dados e esconde o loading quando tudo estiver pronto
(async () => {
    mostrarCarregamento();
    await carregarTodosDadosPokemon();
    await buscarECarregarGeneracoes();
    await buscarECarregarElementos();
    esconderCarregamento();
})();