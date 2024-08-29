/**
 * ConditionalEvent foi desenvolvido para simplificar e agilizar a aplicação de eventos em elementos, com foco especial em formulários.
 * A classe foi criada para facilitar o processo de definição e verificação das condições que precisam ser atendidas para que os
 * eventos sejam executados. No jQuery, isso geralmente requer a criação de funções adicionais para validar essas condições, o
 * que impossibilita a inserção de scripts diretamente no código HTML (inline).
 * ConditionalEvent, torna essa tarefa é simplificada, permitindo uma abordagem mais limpa e eficiente para gerenciar eventos.
 * */
class ConditionalEvent {


    /** @prop {jQuery} target */
    condition = true;
    debugMode = false;

    constructor(debugMode = false) {
        this.debugMode = debugMode;
    }

    /**
     * Mostra alvo se a condição for verdadeira, esconde caso contrário.
     *
     * @param {string|jQuery} target
     *  */
    show(target) {
        target = $(target);
        return this.#process(
            () => target.show(),
            () => target.hide(),
            target,
            'show'
        );
    }

    /**
     * esconde alvo se a condição for verdadeira, mostra caso contrário.
     *
     * @param {string|jQuery} target
     * @return {ConditionalEvent}
     *  */
    hide(target) {
        target = $(target);
        return this.#process(
            () => target.hide(),
            () => target.show(),
            target,
            'hide'
        );
    }

    /**
     * desativa alvo se a condição for verdadeira, ativa caso contrário.
     *
     * @param {string|jQuery} target
     * @return {ConditionalEvent}
     *  */
    disable(target) {
        target = $(target);
        return this.#process(
            () => target.attr('disabled', true),
            () => target.attr('disabled', false),
            target,
            'disable'
        );
    }

    /**
     * ativa alvo se a condição for verdadeira, desativa caso contrário.
     *
     * @param {string|jQuery} target
     * @return {ConditionalEvent}
     *  */
    enable(target) {
        target = $(target);
        return this.#process(
            () => target.attr('disabled', false),
            () => target.attr('disabled', true),
            target,
            'enable'
        );
    }

    /**
     * desliza para baixo (mostra) o alvo se a condição for verdadeira, desliza para cima (esconde) caso contrário.
     *
     * @param {string|jQuery} target
     * @param {number} duration duração do evento
     * @return {ConditionalEvent}
     *  */
    slideDown(target, duration = 400) {
        target = $(target);
        return this.#process(
            () => target.slideDown(duration),
            () => target.slideUp(duration),
            target,
            'slideDown'
        );
    }

    /**
     * desliza para cima (esconde) o alvo se a condição for verdadeira, desliza para baixo (mostra) caso contrário.
     *
     * @param {string|jQuery} target
     * @param {number} duration duração do evento
     * @return {ConditionalEvent}
     *  */
    slideUp(target, duration = 400) {
        target = $(target);
        return this.#process(
            () => target.slideUp(duration),
            () => target.slideDown(duration),
            target,
            'slideUp'
        );
    }

    /**
     * torna o alvo readonly se a condição for verdadeira, torna readwrite caso contrário.
     *
     * @param {string|jQuery} target
     * @return {ConditionalEvent}
     *  */
    readOnly(target) {
        target = $(target);
        return this.#process(
            () => target.attr('readonly', true),
            () => target.attr('readonly', false),
            target,
            'readOnly'
        );
    }

    /**
     * torna o alvo readwrite se a condição for verdadeira, torna readonly caso contrário.
     *
     * @param {string|jQuery} target
     * @return {ConditionalEvent}
     *  */
    readWrite(target) {
        target = $(target);
        return this.#process(
            () => target.attr('readonly', false),
            () => target.attr('readonly', true),
            target,
            'readWrite'
        );
    }

    /**
     * torna o alvo readwrite se a condição for verdadeira, torna readonly caso contrário.
     *
     * @param {string|jQuery} target
     * @param {string} value
     * @param {boolean} ifFalseReturnToOriginalValue Retorna para o valor que estava antes de ser alterado pelo setInputValue, se não tiver sido alterado valor permanece igual.
     * @return {ConditionalEvent}
     *  */
    setInputValue(target, value, ifFalseReturnToOriginalValue = true) {

        target = $(target);

        // Sempre que altera o valor, é criado uma flag no input para retornar para o valor original se a condição for falsa
        // essa flag de retorno deve ser excluída se o usuário realizar qualquer alteração manual no campo
        const onTrue = ()=> {


            target.each((k, e) => {
                e = $(e);
                const type = this.#getInputType(e);

                if(type === 'checkbox'){
                    e.attr('checked', !!value);
                } else {
                    // Valor antes da alteração do input
                    e.attr('data-ce-original-value', e.val())
                    e.val(value);
                }

                // Flag para retornar para o valor original
                if(ifFalseReturnToOriginalValue) {
                    e.attr('data-return-to-original-value', 'Y')
                    this.#logMessage('Foi setado uma flag de retorno para o elemento', e)
                }

            })
        }

        this.#updateEventsThatRemoveReturnFlag();

        const onFalse = () => {
                target.each((k, e) => {
                    e = $(e);
                    const type = this.#getInputType(e);

                    // Deve retornar para o valor anterior apenas se o parâmetro for verdadeiro
                    if(!ifFalseReturnToOriginalValue) return;

                    if(type === 'checkbox'){
                        // como so é possível duas opções no checkbox, é invertido o valor do input se ele tiver a flag de retorno
                        if (e.is('[data-return-to-original-value]')) e.attr('checked', !e.is(':checked'));
                    } else {
                        // Capturado o valor anterior e alterado para o valor atual se o input tiver a flag de retorno
                        const originalValue = e.attr('data-ce-original-value');
                        if (e.is('[data-return-to-original-value]')) e.val(originalValue);
                    }

                    e.removeAttr('data-ce-original-value');
                    e.removeAttr('data-return-to-original-value');
                })
        }

        // É criado um evento para remover a flag de retorno se alguma alteração for feita manualmente pelo usuário



        return this.#process(
            onTrue,
            onFalse,
            target,
            'setInputValue'
        );
    }


    /**
     * Aplica uma condição para os eventos acontecerem
     *
     * @param {boolean} eventsWillRun
     * @return {ConditionalEvent}
     *  */
    ifCondition(eventsWillRun) {
        this.condition = this.condition && eventsWillRun

        return this
    }

    /**
     * Aplica uma condição interpretada pelo valor do input
     *
     * @param {string|jQuery} input
     * @param {string|array|boolean} valueRequired
     * @return {ConditionalEvent}
     *  */
    ifInput(input, valueRequired) {

        valueRequired = Array.isArray(valueRequired) ? valueRequired : [valueRequired];

        input = $(input);

        const type = this.#getInputType(input);

        let condition = false;
        let value;
        if (type === 'select') {
            value = input.find('option:selected').map((k, e) => {
                if (valueRequired.includes($(e).val())) condition = true;
                return $(e).val();
            }).toArray()
        } else if (type === 'checkbox') {
            value = input.is(':checked');
            condition = valueRequired.includes(value)
        } else {
            value = input.val();
            condition = valueRequired.includes(value);
        }

        this.#logMessage('tipo Input:', type, '\nValor esperado: ', valueRequired, "\nvalor do input: ", value, '\nQuery vai ser executada?', condition);

        this.condition = this.condition && condition;

        return this
    }

    ifNotEmpty(input) {
        return this.ifCondition($(input).val().length);
    }

    /**
     * Retorno padrão de todos os eventos.
     *
     * @param {function} onTrue
     * @param {function|null} onFalse
     * @param {string|jQuery} target
     * @param {string} eventName
     * @return {ConditionalEvent}
     *  */
    #process(onTrue, onFalse, target, eventName) {
        this.#logMessage(`Evento: ${eventName}()`, '\nTarget(s): ', target, '\nCondição: ', this.condition);

        if (this.condition && onTrue) {
            onTrue()
        } else if (onFalse) {
            onFalse()
        }

        return this;
    }


    #updateEventsThatRemoveReturnFlag() {
        setTimeout(() => {
            $('[data-return-to-original-value]').off('change').change(({target}) => {
                target = $(target);

                target.removeAttr('data-ce-original-value');
                target.removeAttr('data-return-to-original-value');

                this.#logMessage(
                    'Não será possível retornar para o valor original de', target,
                    '\nMotivo: Usuário realizou uma alteração manual que removeu a flag de retorno deste elemento'
                );
            })
        }, 1000)
    }

    /**
     * Escreve mensagens no console caso o debugMode estiver ativado
     *
     * @param {any} message
     * @return {void}
     *  */
    #logMessage(...message) {
        if (this.debugMode) console.log(...message);
    }

    #getInputType(input) {
        input = $(input);

        let type = input.get(0).tagName.toLowerCase()
        if (type === 'input') {
            type = input.attr('type') ?? 'text';
        }
        return type.toLowerCase();
    }
}

/**
 * cria uma condição com um input para aplicação de eventos
 *
 * @param {string|jQuery|object} input
 * @param {string|array|boolean} valueRequired
 * @param {boolean} debugMode
 * @return {ConditionalEvent} Instância com métodos que ajudam a criar eventos comuns de formulários
 *  */
function ifInput(input, valueRequired, debugMode = false) {
    const ce = new ConditionalEvent(debugMode);
    ce.ifInput(input, valueRequired);
    return ce;
}

/**
 * cria uma condição para aplicação de eventos
 *
 * @param {boolean} condition
 * @param {boolean} debugMode
 * @return {ConditionalEvent} Instância com métodos que ajudam a criar eventos comuns de formulários
 *  */
function ifCondition(condition, debugMode = false) {
    const ce = new ConditionalEvent(debugMode);
    ce.ifCondition(condition);
    return ce;
}

/**
 * Aplica a condição de que o input não esteja vázio
 *
 * @param {string|jQuery|object} input
 * @param {boolean} debugMode
 * @return {ConditionalEvent} Instância com métodos que ajudam a criar eventos comuns de formulários
 *  */
function ifNotEmpty(input, debugMode = false) {
    const ce = new ConditionalEvent(debugMode);
    return ce.ifNotEmpty(input)
}
