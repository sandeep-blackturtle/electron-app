// NPM Modules
import axios from 'axios'
import React, { Component } from 'react'
import { render } from 'react-dom'
const { ipcRenderer } = require('electron');
// Components 
import Image from './components/Image/'
import Model from './components/Model/'
import Input from './components/Input/'
import Button from './components/Button/'
import ImageContainer from './components/ImageContainer/'
// Configuration 
import {url, username, password} from './config/'
// Constants
import {
    ERROR, 
    MESSAGE, 
    INSTALL_UPDATE_DENIED, 
    INSTALL_UPDATE_ACCEPTED, 
    UPDATE_DOWNLOAD_COMPLETE, 
} from "./utils/constants"; 

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            update: ''
        };
    }

    componentDidMount() {
        axios.get(url).then(res => {
            this.setState({ data: res.data })
        });

        ipcRenderer.on(MESSAGE, this.showMessage)
        ipcRenderer.on(UPDATE_DOWNLOAD_COMPLETE, this.handleUpdateDownloaded)
    }

    componentWillUnmount() {
        ipcRenderer.removeListener(MESSAGE, this.showMessage)
        ipcRenderer.removeListener(UPDATE_DOWNLOAD_COMPLETE, this.handleUpdateDownloaded)
    }

    showMessage = (event, data) => {
        console.log('Message:', data)
    }

    handleUpdateDownloaded = (event, data) => {
        console.log( `Downloaded complete: ${data}`)
    }

    handleAcceptUpdateInstall = () => {
        console.log('Accepted:')
        ipcRenderer.send(INSTALL_UPDATE_ACCEPTED, 'Accepted......')
    }

    render() {
        return (
            <div>
                <ImageContainer data={this.state.data}/>
                <Model>
                    <Input type={'text'} lable={'Username'} name={'username'}/>
                    <Input type={'password'} lable={'Password'} name={'password'}/>
                    <Button className="submit" value={'Submit'} onClick={this.handleAcceptUpdateInstall}/>
                </Model>
            </div>
        )
    }
}

export default App
