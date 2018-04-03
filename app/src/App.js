//modules 
import React, {Component} from 'react'
import {render} from 'react-dom'
import axios from 'axios'
//components 
import Image from './components/Image/'
import ImageContainer from './components/ImageContainer/'
//configuration 
import URL from './config/'

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: []
        };
    }

    componentDidMount() {
        axios.get(URL.url).then(res => {
            this.setState({
                data: res.data
            });
        })
    }

    render() {
        return (
            <div>
                <ImageContainer data={this.state.data}/>
            </div>
        )
    }
}

export default App
