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
    INVALID_CREDENCIALS, 
    APP_UPDATE_PERMISSION, 
    UPDATE_WILL_INSTALL_NOW, 
    UPDATE_DOWNLOAD_COMPLETE, 
} from "./utils/constants"; 

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            username: '',
            password: '',
            newUpdate: false,
            authStatus: null,
            acceptUpdateInstall: false,
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

    handleInputValueChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value 
        })
    }

    handleValidateCredencials = () => {

        if(username!=this.state.username || password!=this.state.password) {
            this.setState(prevState => ({
                authStatus: INVALID_CREDENCIALS
            }))
        }
        else {
            this.setState(prevState => ({
                authStatus: UPDATE_WILL_INSTALL_NOW
            }))
            ipcRenderer.send(APP_UPDATE_PERMISSION, install)
        }
    }

    handleModelClose = () => {
        this.setState(prevState => ({
            acceptUpdateInstall: false
        }))
    }

    render() {
        return (
            <div className="app">
                {
                    this.state.newUpdate ?
                    <Alert value={'Update Available'}>
                        <Button className="cancel-button" value={'Cancel'} onClick={() => this.handleDeniedUpdateInstall(false)}/>
                        <Button className="update-button" value={'Update'} onClick={() => this.handleAcceptUpdateInstall(true)}/>
                    </Alert>
                    : null
                }
                <ImageContainer data={this.state.data}/>
                {
                    this.state.acceptUpdateInstall ? 
                    <Model 
                        title={this.state.authStatus}
                        titleClassName={this.state.authStatus==INVALID_CREDENCIALS ? 'error' : 'success'}
                    >
                        <Input 
                            type={'text'}
                            lable={'Username'}
                            name={'username'}
                            value={this.state.username}
                            onChange={this.handleInputValueChange}
                        />
                        <Input 
                            type={'password'}
                            lable={'Password'}
                            name={'password'}
                            value={this.state.password} 
                            onChange={this.handleInputValueChange}
                        />
                        <Button type={'button'} className="submit-button" value={'Submit'} onClick={this.handleValidateCredencials}/>
                        <Button type={'button'} className="model-close" value={'X'} onClick={this.handleModelClose}/>
                    </Model>
                    : null
                }
            </div>
        )
    }
}

export default App
