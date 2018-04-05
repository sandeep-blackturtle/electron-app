// NPM Modules
import axios from 'axios'
import React, { Component } from 'react'
import { render } from 'react-dom'
const { ipcRenderer } = require('electron');
// Components 
import Image from './components/Image/'
import Model from './components/Model/'
import Input from './components/Input/'
import Alert from './components/Alert/'
import Button from './components/Button/'
import ImageContainer from './components/ImageContainer/'
// Configuration 
import {url, username, password} from './config/'
// Constants
import {
    ERROR, 
    MESSAGE, 
    APP_UPDATE_PERMISSION, 
    UPDATE_DOWNLOAD_COMPLETE, 
} from "./utils/constants"; 

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            newUpdate: false,
            acceptUpdateInstall: false
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
        console.log('Downloaded complete:', data)
        this.setState(prevState => ({ newUpdate: true }))
    }

    handleAcceptUpdateInstall = (install) => {
        this.setState(prevState => ({
            newUpdate: true, 
            acceptUpdateInstall: true 
        }))
    }

    handleDeniedUpdateInstall = (install) => {
        this.setState(prevState => ({
            newUpdate: true
        }))
    }

    handleValidateCredencials = () => {
        console.log('Install:', install)
        //ipcRenderer.send(APP_UPDATE_PERMISSION, install)
    }

    render() {
        return (
            <div className="app">
                {
                    this.state.newUpdate==false ?
                    <Alert value={'Update Available'}>
                        <Button className="cancel-button" value={'Cancel'} onClick={() => this.handleDeniedUpdateInstall(false)}/>
                        <Button className="update-button" value={'Update'} onClick={() => this.handleAcceptUpdateInstall(true)}/>
                    </Alert>
                    : null
                }
                <ImageContainer data={this.state.data}/>
                {
                    this.state.acceptUpdateInstall ? 
                    <Model>
                        <Input type={'text'} lable={'Username'} name={'username'}/>
                        <Input type={'password'} lable={'Password'} name={'password'}/>
                        <Button className="submit-button" value={'Submit'} onClick={this.handleValidateCredencials}/>
                    </Model>
                    : null
                }
            </div>
        )
    }
}

export default App
