import component from './component';
import backend from './backend';

export default () => function utRule() {
    return {
        config: require('./config'),
        browser: () => [
            backend,
            ...component
        ]
    };
};
