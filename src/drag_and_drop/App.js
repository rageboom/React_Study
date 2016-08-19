import React, {Component, PropTypes} from 'react';
import ReactDOM, {render} from 'react-dom';
import Container from './Container';

class App extends Component {
    render() {
        return (
            <Container/>
        );
    }
}

render(<App />, document.getElementById('root'));
