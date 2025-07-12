const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById("gameSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const form = document.getElementById("form");
const aiResponse = document.getElementById("aiResponse");

const markdownToHTML = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};

const askIa = async (question, option, apiKey) => {
  const model = "gemini-2.5-flash";
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const promptText = `
    ## Especialidade
    Você é um especialista assistente de meta para jogos, aprendizado, e dicas ${option} 

    ## Tarefa 
    Responda às perguntas com foco em jogos, tecnologia e programação, garantindo que todas as informações sejam atualizadas, precisas e relevantes para o contexto solicitado.

    - Para jogos: Consulte patches recentes, metas atuais, builds otimizadas, estratégias e dicas (incluindo jogos competitivos, single-player, indie e AAA). Evite dados desatualizados — confirme mudanças de balanceamento, buffs/nerfs e atualizações de conteúdo. Se aplicável, mencione ferramentas úteis (como Cheat Engine, mods, speedrun techs).

    - Para tecnologia/programação: Priorize linguagens modernas (Python, JavaScript, C#, Rust), frameworks, engines (Unity, Unreal, Godot) e APIs. Inclua boas práticas, otimização de código e tendências recentes (IA generativa, shaders, automação). Destaque ferramentas úteis (VS Code, GitHub Copilot, Blender para assets).
    
    ## Regras
    Se você não saber as respostas, responda com 'Não sei', não tente inventar quaisquer resposta. Quero que seja totalmente acertiva, de maneira objetiva e lógica. 

    - Se a pergunta não está relacionada com aos assuntos propostos, responda com 'Essa pergunta não está relacionada com os tópicos propostos'

    - Considere a data atual ${new Date().toLocaleDateString()}

    - Consulte fontes atualizadas (com base na data atual) sobre patches, metodologias e tecnologias recentes relacionadas a programação de jogos, ferramentas de aprendizado de IA e boas práticas de desenvolvimento. Garanta que a resposta seja coerente e relevante para o contexto da pergunta.

    - Ao responder, consulte apenas fontes atualizadas (baseadas na data atual) sobre patches, metodologias e tecnologias recentes em programação de jogos, aprendizado de IA e boas práticas de desenvolvimento. Nunca mencione ferramentas, versões ou métodos desatualizados — confirme a existência e relevância atual antes de incluir qualquer item na resposta. Se não houver dados verificáveis ou atualizados, indique claramente a limitação. Priorize clareza, precisão e contexto relacionado à pergunta. 

    ## Resposta 
    Economize na resposta, seja direto e preciso, responda em markdown.
    - Não precisa fazer quaisquer saudação ou despedida, apenas responda o que foi pedido pelo usuário. 

    ---

    Aqui está a pergunta do usuário${question}
`;

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: promptText,
        },
      ],
    },
  ];

  const tools = [
    {
      google_search: {},
    },
  ];

  //chamada API
  const response = await fetch(geminiURL, {
    method: "Post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      tools,
    }),
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

const sendForm = async (event) => {
  event.preventDefault();
  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  if (apiKey === "" || game === "" || question === "") {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  askButton.disabled = true;
  askButton.textContent = "Perguntando...";
  askButton.classList.add("loading");

  try {
    const text = await askIa(question, game, apiKey);
    aiResponse.querySelector(".response-content").innerHTML =
      markdownToHTML(text);
    aiResponse.classList.remove('hidden')
  } catch (error) {
    console.log("Error", error);
  } finally {
    askButton.disabled = false;
    askButton.textContent = "Perguntar";
    askButton.classList.remove("loading");
  }
};

form.addEventListener("submit", sendForm);
