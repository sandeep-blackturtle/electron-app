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
import Button from './components/Button/'
//configuration 
import {url, username, password} from './config/'
import {
    MESSAGE, 
    UPDATE_AVAILABLE, 
    CHECKING_FOR_UPDATE,
    UPDATE_NOT_AVAILABLE, 
    DOWNLOAD_UPDATE_DENIED, 
    DOWNLOAD_UPDATE_ACCEPTED, 
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
        ipcRenderer.on(UPDATE_AVAILABLE, this.handleUpdateAvailable)
        ipcRenderer.on(UPDATE_NOT_AVAILABLE, this.handleUpdateNotAvailable)
        ipcRenderer.on(CHECKING_FOR_UPDATE, this.handleCheckingForUpdate)
    }

    componentWillUnmount() {
        ipcRenderer.removeListener(MESSAGE, this.showMessage)
        ipcRenderer.removeListener(UPDATE_AVAILABLE, this.handleUpdateAvailable)
        ipcRenderer.removeListener(UPDATE_NOT_AVAILABLE, this.handleUpdateNotAvailable)
        ipcRenderer.removeListener(CHECKING_FOR_UPDATE, this.handleCheckingForUpdate)
    }

    showMessage = (event, data) => {
        console.log('Message:::', data)
    }

    handleCheckingForUpdate = (event, data) => {
        console.log('CHECK::')
        console.log('CHECK::', data)
    }

    handleUpdateAvailable = (event, data) => {
        console.log('UPA::')
        console.log('UPA::', data)
    }

    handleUpdateNotAvailable = (event, data) => {
        console.log('UPNA::')
        console.log('UPNA::', data)
    }

    handleAcceptUpdateDownload = () => {
        console.log('Accepted::')
        ipcRenderer.send(DOWNLOAD_UPDATE_ACCEPTED, 'Accepted......')
    }

    render() {
        return (
            <div>
                <ImageContainer data={this.state.data}/>
                <Model>
                    <Input type={'text'} lable={'Username'} name={'username'}/>
                    <Input type={'password'} lable={'Password'} name={'password'}/>
                    <Button className="submit" value={'Submit'} onClick={this.handleAcceptUpdateDownload}/>
                </Model>
            </div>
        )
    }
}

export default App
