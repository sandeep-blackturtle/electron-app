//modules
const { ipcRenderer } = require('electron');
import React, {Component} from 'react'
import {render} from 'react-dom'
import axios from 'axios'
//components 
import Image from './components/Image/'
import ImageContainer from './components/ImageContainer/'
import Model from './components/Model/'
import Input from './components/Input/'
//configuration 
import URL from './config/'

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            update: ''
        };
    }

    componentDidMount() {

        axios.get(URL.url).then(res => {
            this.setState({ data: res.data })
        })

        ipcRenderer.on('message', function(event, text) {
            this.setState({ update: text })
        })
    }

    autoUpdate() {
        return <h1>Message:: {this.state.update}</h1>
    }

    render() {
        return (
            <div>
                <ImageContainer data={this.state.data}/>
                {/* <Model>
                    <Input type={'text'} lable={'Username'} name={'username'}/>
                    <Input type={'password'} lable={'Password'} name={'password'}/>
                    <Input type={'submit'} className="submit" value={'Submit'}/>
                </Model> */}
                { this.autoUpdate() }
            </div>
        )
    }
}

export default App
