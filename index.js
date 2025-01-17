module.exports = () => function utRule() {
    return {
        config: require('./config'),
        adapter: () => [
            require('./api/sql/schema'),
            require('./api/sql/seed'),
            require('./api/sql/standard'),
            require('./test/seed'),
            require('./errors')
        ],
        orchestrator: () => [
            require('ut-dispatch-db')(['rule'], ['utRule.rule'], ['utRule.validation']),
            require('./api/script'),
            require('./errors')
        ],
        gateway: () => [
            require('./errors'),
            require('./validations')
        ],
        test: () => [
            ...require('./test/steps')
        ]
    };
};
