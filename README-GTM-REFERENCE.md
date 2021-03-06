#  Referência técnica
> Analytics Helper para o Google Tag Manager

Este documento introduz as APIs e funcionalidades desenvolvidas para o suporte ao Google Tag Manager (GTM). São importantes algumas configurações do lado da própria ferramenta para que o código implementado na tag do Analytics Helper tenha o comportamento esperado. Mais detalhes sobre [aqui](https://github.com/DP6/analytics-helper/blob/master/README-GTM-CONFIG.md).

## Objeto options

O objeto `options` contém as configurações globais do *Analytics Helper*. Os valores padrões servem na maioria dos casos, por isso devem ser alterados com cautela e de forma consciente.

```javascript
    var options = {
      helperName: 'analyticsHelper',
      dataLayerName: 'dataLayer',
      debug: ({{Container ID}} || ''),
      waitQueue: true,
      containerID: ({{Container ID}} || ''),
      exceptionEvent: 'gtm_dataQuality_event',
      exceptionCategory: 'GTM Exception',
      customNamePageview: 'ga_pageview',
      customNameEvent: 'ga_event',
      errorSampleRate: 1
    };
```

### init(opt_options)

Utilize esta função, de caráter opcional, para inicializar o Analytics Helper com opções diferentes das padrões. Recebe como argumento o objeto `opt_options`, que possui as seguintes chaves:

* `helperName` -- Por padrão `"analyticsHelper"`. 
   Uma string que indentifica o nome da instância do _Analytics Helper_ no objeto _window_ do navegator. O tagueamento não é afetado pela mudança desse valor, se feito pela função `safeFn` (recomendado).

* `dataLayerName` -- Por padrão `"dataLayer"`.
  Uma string que identifica o nome da instância da *camada de dados* no objeto _window_ do navegador. Deve ser o mesmo valor configurado no *snippet* do GTM para que as funções de interface do *Analytics Helper* (ex: `getDataLayer`) funcionem.

* `debug` -- Por padrão é a variavél `{{Debug Mode}}` do GTM. Se desabilitada, é `false`.
  Um booleano que sinaliza para o *Analytics Helper* se o contexto atual é de depuração ou produção. Caso verdadeiro, os eventos serão disparados apenas via `console.log`, sem envios para o GA.

* `waitQueue` -- Por padrão é `true`
  Um booleano que sinaliza para o *Analytics Helper* se ele deve utilizar uma fila de espera nos eventos. Caso verdadeiro, todos eventos serão empilhados numa estrutura interna até que ocorra o primeiro pageview na página. Recomendamos que essa opção esteja sempre ativada, pois evita inconsistências nos relatórios do GA.

* `containerID` -- Por padrão é a variável `{{Container ID}}` do GTM. Se desabilitada, é a string vazia `''`.
  Uma string que deve ser equivalente ao ID do contêiner do GTM onde o *Analytics Helper* foi configurado (GTM-XXXXX). Não deve ser outro valor.

* `exceptionEvent` -- Por padrão `"gtm_dataQuality_event"`.
  Uma string que identifica o evento enviado à camada de dados caso ocorra alguma exceção no código do GTM. Esta opção suporta a ideia da coleta para uma propriedade do Google Analytics de [*Quality Assurence*](https://www.observepoint.com/blog/why-automate-your-web-analytics-qa/) . Para entender melhor o uso desta configuração, [consultar documentação de configuração do GTM](https://github.com/DP6/analytics-helper/blob/master/README-GTM-CONFIG.md).

* `exceptionCategory` -- Por padrão  `"GTM Exception"`.
  Uma string que indica qual o valor que deve ser preenchido na chave `"event_category"` do evento enviado à camada de dados caso ocorra alguma exceção no código do GTM. Esta opção suporta a ideia da coleta para uma propriedade do Google Analytics de [*Quality Assurence*](https://www.observepoint.com/blog/why-automate-your-web-analytics-qa/) . Para entender melhor o uso desta configuração, [consultar documentação de configuração do GTM](https://github.com/DP6/analytics-helper/blob/master/README-GTM-CONFIG.md)

* `customNamePageview` -- Por padrão `"ga_pageview"`.
  Uma string que identifica o evento enviado à camada de dados toda vez que a função `pageview` (ver abaixo) for chamada.

* `customNameEvent` -- Por padrão `"ga_event"`.
  Uma string que identifica o evento enviado à camada de dados toda vez que a função `event` (ver abaixo) for chamada.

* `errorSampleRate` -- Por padrão `1` .
  Deve ser um inteiro entre 0 e 1, que controla o nível de amostragem dos erros enviados ao GA de *Data Quality* **(mais detalhes à adicionar)**. Serve para controlar a coleta em ambientes onde o volume de disparos é muito grande.

## API

### Coleta Google Analytics (GA)
As funções a seguir possuem especificidades para coleta de dados baseado nas ferramentas GA e GTM. Devido a isso, as funções internas desta API utilizam a variável criada pelo GTM chamada [`dataLayer`](https://developers.google.com/tag-manager/devguide). Para garantir que as funcionalidades das funções estejam corretas, será necessário garantir que o ambiente em questão possua a camada de dados inicializada corretamente.

#### pageview(path, object)
Utilizada para o disparo de pageview personalizado.

##### Parâmetros
 * `path` (opcional): String que recebe o path do Pageview personalizado.
 * `object` (opcional): Objeto que será atribuído ao pageview. Pode ser utilizado para passar objetos de Enhanced Ecommerce, além de métricas e dimensões personalizadas. Qualquer chave personalizada será inserida como push no dataLayer.

##### Exemplo de código
```javascript
analyticsHelper.pageview('/post/finalizou-leitura', {
  'dimension1' : "Área Aberta",
  'dimension2' : "Data Science"
});
```

#### event(category, action, label, value, object)
Utilizada para efetuar disparos de eventos.

##### Parâmetros
* `category`: String que representa a categoria do evento.
* `action`: String que representa a ação do evento.
* `label` (opcional): String que pode representar o label do evento.
* `value` (opcional): Numeric que pode representar o value do evento.
* `object` (opcional): Objeto que será atribuído ao pageview. Pode ser utilizado para passar objetos de Enhanced Ecommerce, além de métricas e dimensões personalizadas. Qualquer chave personalizada será inserida como push no dataLayer.

##### Exemplo de código
```javascript
analyticsHelper.event('MinhaCategoria', 'MinhaAcao', 'MeuRotulo', 'MeuValor', {
  dimension1: 'São Paulo'
});
```

### Utilidades

#### getDataLayer(key)
Retorna qualquer objeto contido no dataLayer exposto no ambiente. Esta função é um encapsulamento da [macro .get() do GTM](https://developers.google.com/tag-manager/api/v1/reference/accounts/containers/macros). 

##### Argumentos
* `key`:  String que representa a chave do objeto a ser recuperado.

##### Retorno:
* **ANY**: O valor recuperado do modelo de dados do GTM.

##### Exemplo de código
```javascript
dataLayer.push({
  meuObjeto: 'valor',
  meuOutroObjeto: 'outroValor'
});

analyticsHelper.getDataLayer('meuObjeto'); // valor
```

#### getKey(key, opt_root)
Encontra um objeto ou valor pela chave informada. Caso alguma das chaves em cadeia não existir, a função retorna undefined, evitando assim o lançamento de exceptions.

##### Argumentos
* `key`: String que representa a chave do objeto a ser encontrado
* `opt_root` (Opcional):  Objeto que possui a chave a ser encontrada.

##### Retorno
* **ANY**: O valor recuperado do modelo de dados da variável informada.

##### Exemplo com objeto no escopo global
```javascript
var objeto = {
  meuObjeto: {
    meuArray: [{
      minhaChave: 'encontrei meu valor'
    }]
  }
};

analyticsHelper.getKey('objeto.meuObjeto.meuArray.0.minhaChave'); // encontrei meu valor
analyticsHelper.getKey('objeto.chaveNaoExistente.meuArray.0.minhaChave'); // undefined
```

##### Exemplo com objeto-raiz passado por parâmetro
```javascript
var objeto = {
  meuObjeto: {
    meuArray: [{
      minhaChave: 'encontrei meu valor'
    }]
  }
};

analyticsHelper.getKey('meuObjeto.meuArray.0', objeto); // Object {minhaChave: "encontrei meu valor"}
```

#### sanitize(text, opts)
Retorna um texto sem caracteres especiais, assentos espaços ou letras maiúsculas (opcionalmente).

##### Argumentos
* `text`: String a ser tratada
* `opts` (opcional): Objeto com variáveis para configuração da função sanitize.
	* `capitalized`: Define a forma com que a String será tratada.
	    - true: Coloca a String como Camel Case;
	    - false: Coloca a String como Snake Case.

##### Retorno
* **String**: O valor recebido por parâmetro e modificado pela função.

##### Exemplo de código
```javascript
analyticsHelper.sanitize('Minha String Suja'); // minha_string_suja
analyticsHelper.sanitize('Minha String Suja', true); // MinhaStringSuja
```

#### cookie(name, value, opts)
Cria um cookie ou retorna seu valor baseado nos parâmetros recebidos na função.

##### Argumentos
* `name`: String que representa o nome do cookie;
* `value`: String que representa o valor do cookie;
* `opts` (opcional): Objeto com variáveis para configuração da função cookie:
    - `exdays` (opcional): Numeric que representa a quantidade de dias para a expiração do cookie;
    - `domain`:  (opcional): String que representa o domínio ao qual o cookie deve ser atribuído;
    - `path` (opcional): String que representa o path do site ao qual o cookie deve ser atribuído;

##### Retorno
* **String**:  Valor completo do cookie criado ou recuperado.

##### Exemplo de criação de cookie
```javascript
analyticsHelper.cookie('meuCookie', 'meuValor', {
  exdays: 3, // Dias para expiração
  domain: 'meudominio.com.br', // Domínio que o cookie atribuído
  path: '/meu-path' // Path do cookie
}); // meuCookie=meuValor; expires=Sun, 16 Oct 2016 19:18:17 GMT; domain=meudominio.com.br; path=/meu-path
```

##### Exemplo de recuperar valor de um cookie
```javascript
analyticsHelper.cookie('meuCookie'); // meuValor
```

### SafeFn

Função segura do Analytics Helper. O principal conceito por trás da sua utilização é a garantia da não interferência da coleta de dados no comportamento natural do portal de sua utilização, evitando vazamento de logs e erros ao ambiente em questão.	

Para efetivar essa proposta, a função recebe um callback de parâmetro. Dentro do escopo deste callback, é possível receber um objeto de parâmetro com funções estendidas do helper, com o intuito de garantir o encapsulamento de funções sensíveis. Este objeto será representado daqui em diante como "Helper Interno" (mais detalhes na próxima seção).

#### Argumentos da função
* `id`: Deve receber o nome da tag (do GTM) em que o código em questão estiver contido.
* `callback`: Função de callback que cria o escopo para o ambiente seguro do safeFn. Passa via parâmetro o Helper Interno para utilização.
* `immediate` (Opcional): Variável booleana, que por default (**true**) executa a função de callback imediatamente. Caso **false**, o retorno do da função será a própria função de callback, que deverá ser executada manualmente quando necessário.

#### Retorno
* **Function** ou **undefined**: Caso o parâmetro `immediate` receba o valor true, o safeFn executa o callback e retorna undefined. Porém se o parâmetro `immediate` ter o valor false, o retorno é a própria função de callback para ser executada posteriormente. 

##### Exemplo de código

```javascript
analyticsHelper.safeFn('Nome da Tag do GTM', function (helper) {
  helper.event('MinhaCategoria', 'MinhaAcao', 'MeuRotulo', 'MeuValor', {
    dimension1: 'São Paulo'
  });
});
```

#### Lançamento de Exceptions
A função `safeFn` tem um tratamento específico para as Exceptions que ocorrerem dentro do seu escopo seguro. Utilizando as variáveis de personalização do Helper options.debug, options.exceptionEvent, options.exceptionCategory e options.errorSampleRate, a função atribui valores ao dataLayer do GTM, que utilizará a configuração do GTM para o envio de eventos ao Google Analytics. Esta prática é baseada na concepção de [Quality Assurance](https://www.observepoint.com/blog/why-automate-your-web-analytics-qa/).

### Helper interno
Objeto com funções internas passados via parâmetro no callback da função `safeFn`.

#### on(event, selector, callback)

A função `on` serve para executar um callback ao executar algum evento em um elemento HTML específico. Em caso de não haver jQuery na página, ele se baseia na função querySelectorAll do javascript, e por conta disso, é preciso ficar atento a compatibilidade dos navegadores. Não é recomendado a utilização desta função em páginas que oferecem suporte a IE 8.

#### Argumentos
* `event`: String do evento que ira executar o callback, exemplos: 'mousedown', 'click', etc.
[Saiba mais](https://mdn.mozilla.org/en-US/docs/Web/Events).

* `selector`: String do Seletor CSS que irá buscar os elementos que executarão o callback no disparo do evento.
[Saiba mais](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors).

* `callback`: Função executada no disparo do evento infomado no parâmetro `event`.

##### Exemplo de código

```javascript
analyticsHelper.safeFn('Nome da Tag', function (helper){
  helper.on('mousedown', '#botaoX', function () {
    helper.event('MinhaCategoria', 'MinhaAcao', 'MeuRotulo');
  });
});
```

#### wrap(elm)
A função `wrap` provê diversas funções facilitadoras para interações com o DOM no intuito de padronizar e compatibilizar a coleta de dados em ambientes sem o conceito de [camada de dados](https://blog.dp6.com.br/o-que-%C3%A9-a-camada-de-dados-ou-data-layer-80f37fa3429c). A motivação para a elaboração desta função é a não dependências de bibliotecas de mercado, como o jQuery, com o intuito de não depender da instalação das mesmas nos ambientes tagueados. Ao executar a função, um objeto com as funções facilitadoras será retornado.

##### Argumentos
* `elm`
String, elemento HTML ou Array de elementos HTML. Em caso de String, o mesmo é utilizado como seletor CSS, trazendo todos os elementos que cruzarem com o seletor. Caso contrário, o wrap funcionará a partir dos elemento enviados para fazer o bind no DOM Tree.

##### Retorno
* **Object**: Funções facilitadoras a serem executadas.

##### Exemplos de código
```javascript
// Apenas um elemento
analyticsHelper.safeFn('Nome da Tag', function(helper){
  helper.on('mousedown', '#botaoX', function () {
    var text = helper.wrap(this).text({santize: true});
    helper.event('Categoria', 'Ação', 'Label_' + text);
  });
});

// Múltiplos elementos
analyticsHelper.safeFn('Nome da Tag', function(helper){
  var urls = helper.wrap('a');
  console.log(urls); // Array de nodes a.
});
```

### Objeto Wrap

Objeto gerado pela função wrap, inclui diversas funções que ajudam na manipulação do DOM. As funções facilitadoras contidas neste objeto tem como objetivo diminuir a verbosidade do código JavaScript e evitar o uso de bibliotecas dependentes dos ambientes tagueados.

#### Atributo nodes
Array de elementos HTML ou [NodeList](https://developer.mozilla.org/en-US/docs/Web/API/NodeList) que será a base das funções.

#### hasClass(className, opts)
Função que verifica se o elemento HTML tem a classe passada por parâmetro.

##### Argumentos
* `className`: String do nome da classe a ser batida com o elemento.

* `opts` (opcional): Objeto com variáveis para configuração da função hasClass.
	* `toArray`: Caso o valor seja true, retorna o array de resultados relacionados à comparação.

##### Retorno
* **Boolean** ou **Array de Boolean**: Caso o parâmetro `opts`seja informado com o atributo `toArray`recebendo o valor true, o retorno da função será o array o boolean de elementos encontrados. Caso somente o parâmetro `className` seja informado, a função retorno true ou false se encontrar ou não algum elemento com a classe especificada. 

##### Exemplo de código
```javascript
analyticsHelper.safeFn('Nome da Tag', function(helper){
  helper.on('mousedown', '.button', function () {
    if(helper.wrap(this).hasClass('myClass')){
      helper.event('MinhaCategoria', 'MinhaAcao', 'MeuRotulo');
    }
  });
});
```

#### matches(selector, reduce)
Função que verifica se o elemento HTML confere com o seletor.

##### Argumentos
* `selector`String do seletor a ser batido com o elemento.

* `opts` (opcional): Objeto com variáveis para configuração da função matches.
	* `toArray`: Caso o valor seja true, retorna o array de resultados relacionados à comparação.

##### Retorno
* **Boolean** ou **Array de Boolean**: Caso o parâmetro `opts`seja informado com o atributo `toArray`recebendo o valor true, o retorno da função será o array o boolean de elementos encontrados. Caso somente o parâmetro `selector` seja informado, a função retorno true ou false se encontrar ou não algum elemento com a classe especificada. 

##### Exemplo de código
```javascript
analyticsHelper.safeFn('Nome da Tag', function(helper){
  helper.on('mousedown', '.button', function () {
    if(helper.wrap(this).matches('.myClass' , true)){
      helper.event('MinhaCategoria', 'MinhaAcao', 'MeuRotulo');
    }
  });
});
```

#### closest(selector)
Para cada elemento no conjunto, obtenha o primeiro elemento que corresponde ao seletor, testando o próprio elemento e atravessando seus antepassados ​​na árvore [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model).

##### Argumentos
* `selector`: String do seletor CSS que baterá com o elemento HTML.

##### Retorno
* **Nodelist**: Os elementos que bateram com o seletor informado.

##### Exemplo de código
```javascript
analyticsHelper.safeFn('Nome da Tag', function(helper){
  helper.on('mousedown', '.button', function () {
    var text = helper.wrap(this).closest('div.parentDivWithText').text({sanitize: true, onlyFirst: true});
      helper.event('MinhaCategoria', 'MinhaAcao', 'MeuRotulo' + text);
    });
  });
});
```

#### text(opt)
Função que retorna o texto do elemento.

##### Argumentos
* `opt`: Objeto com variáveis para configuração da função text.

  * `sanitize`: Boolean que em caso de true retorna o valor sanitiziado pela função sanitize.

  * `onlyFirst`: Boolean que em caso de true retorna somente o texto direto do elemento e não de todos os seus filhos.

  * `onlyText`: Boolean que em caso de true retorna o texto concatenado ao invés de um array de Strings.

##### Retorno

##### Exemplo de código
```javascript
analyticsHelper.safeFn('Nome da Tag', function(helper){
    var text = helper.wrap('#myId').text({
        sanitize: true, 
        onlyFirst: true, 
        onlyText: true
    });
    helper.pageview(text);
});
```

#### find(sel)
Função que retorna um objeto Wrap de todos os elementos que batem com o seletor.

##### Argumentos
* `sel`: String do seletor CSS que baterá com o elemento HTML.

##### Retorno

##### Exemplo de código
```javascript
analyticsHelper.safeFn('Nome da Tag', function(helper){
    var text = helper.wrap('#myId').find('.myClass').text();
    helper.pageview('/' + helper.sanitize(text));
});
```

#### map(func, params)
Função que executa um código para cada elemento. Possui o mesmo comportamento da API [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).

##### Argumentos
* `func`: Função a ser executada, pode receber um parâmetro que será a referência do elemento iterado.

* `params`: Array de parâmetros utilizados na função.

#### Exemplo de código
```javascript
analyticsHelper.safeFn('Nome da Tag', function(helper){
    var sources = helper.wrap('img').map(function(elm){
        return elm.src;
    });
    console.log(sources); // Array com os valores do atributo src de cada elemento img.
});
```

#### Tamanho do Pacote
| Compactação         | Tamanho (KB) |
| ------------------- | ------------ |
| Sem compactação     | 12.73        |
| Minificado pelo GTM | 6.09         |
| Com GZip            | 2.45         |

#### Créditos

**Obrigado deus !!!**

![alt text](https://ogimg.infoglobo.com.br/in/18001046-646-3f0/FT1086A/420/ronaldinho_barcelona.jpg "Gratidão!")
