
_createCommandAssumptions = function(){
	CommandAssumptions.remove({});
	

	var commandAssumptions = {
		'comprar': ['comprar', 'quero comprar', 'compra-me', 'compra-me ai',],
		'adicionar': ['quero adicionar', 'quero', 'selecionar', 'seleciona', 'adicionar','adiciona', 'acrescentar', 'acrescente', 'acrescenta', 'adiciona à', 'mete','mete na','põe','pões na'],
		'criar' : ['criar', 'cria', 'crie', 'cria uma nova','cria-me uma nova','faz uma nova', 'faz-me uma nova'],
		'remover' : ['limpar', 'remover', 'remove', 'remova', 'tirar', 'tira', 'tira ai', 'não quero', 'apagar', 'apaga', 'apaga ai'],
		'procurar' : ['procurar', 'procura', 'procure', 'procura-me', 'encontra', 'encontrar', 'encontra-me', 'mostra-me', 'mostra',],
		'linguagem' : ['mudar a linguagem', 'mudar a língua', 'muda a linguaguem', 'muda a língua','trocar a linguagem','troca a linguagem', 'troca a língua'],
		'finalizar' : ['finalizar', 'finaliza', 'terminar', 'termina', 'está bom', 'está tudo','nao quero mais nada', 'envia lista para email', 'envia a lista para o meu email', 'envia para o mail'],
		'encomendar' : ['encomendar', 'encomenda', 'manda vir', 'quero encomendar'],
		'mostrar': ['mostrar lista', 'mostra-me a lista', 'mostrar lista de compras', 'mostrar lista', 'mostra a lista',],
		'esconder': ['esconder lista', 'esconde-me a lista', 'esconder lista de compras', 'esconder lista', 'esconder a lista',],
		'ajuda': ['ajuda', 'como funciona', 'help', 'ajuda-me', 'mostrar ajuda',],
		'hello': ['olá', 'alô', 'olá jarbas',],
		'jarbas': ['jarbas', 'jarvas', 'jarvis','armas'],

		'logout': ['fazer logout', 'faz-me logout', 'quero fazer logout', 'logout'],
	};

	_.each(commandAssumptions, function(command_list, action){
		CommandAssumptions.insert({
			action: action,
			command_list: command_list
		});
	});
};