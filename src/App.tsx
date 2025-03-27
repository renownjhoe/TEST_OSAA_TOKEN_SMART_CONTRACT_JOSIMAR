import React, { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import { Container, Row, Col, Button, Alert, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import OSAATokenABI from './OSAAToken.json';
import './App.css';
import { CopyIcon } from 'lucide-react';

const App: React.FC = () => {
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [account, setAccount] = useState<string>('');
    const [balance, setBalance] = useState<string>('0');
    const [error, setError] = useState<string | null>(null);
    const [addressError, setAddressError] = useState<string | null>(null);
    const [connecting, setConnecting] = useState(false);
    const [tokenContract, setTokenContract] = useState<any>(null);
    const [recipientAddress, setRecipientAddress] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [mintAmount, setMintAmount] = useState('');
    const [contractAddress, setContractAddress] = useState('');
    const [isContractAddressValid, setIsContractAddressValid] = useState(true);

    const initializeWeb3 = useCallback(async () => {
        if (window.ethereum) {
            try {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);
                await updateAccountAndBalance(web3Instance);

                window.ethereum.on('accountsChanged', handleAccountsChanged);
                window.ethereum.on('chainChanged', handleChainChanged);
            } catch (err: any) {
                setError('Failed to initialize Web3.');
                console.error('Web3 initialization error:', err);
            }
        } else {
            setError('MetaMask is not installed.');
        }
    }, []);

    useEffect(() => {
        initializeWeb3();

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, [initializeWeb3]);

    useEffect(() => {
        if (web3 && contractAddress) {
            try {
                setTokenContract(new web3.eth.Contract(OSAATokenABI.abi, contractAddress));
            } catch (err) {
                setError('Failed to create contract instance.');
                console.error('Contract instantiation error:', err);
            }
        }
    }, [web3, contractAddress]);

    const updateAccountAndBalance = useCallback(async (web3Instance: Web3) => {
        try {
            const accounts = await web3Instance.eth.getAccounts();
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                if (tokenContract) {
                    try {
                        const balanceWei = await tokenContract.methods.getBalance(accounts[0]).call();
                        const balanceEth = web3Instance.utils.fromWei(balanceWei, 'ether');
                        setBalance(parseFloat(balanceEth).toFixed(4));
                    } catch (err) {
                         setError('Failed to get balance.');
                         console.error("Error getting balance", err);
                    }
                }
            } else {
                setAccount('');
                setBalance('0');
            }
        } catch (err: any) {
            setError('Failed to update account/balance.');
            console.error('Account/balance update error:', err);
        }
    }, [tokenContract]);

    const handleCopyAddress = () => {
        if (account) {
            navigator.clipboard.writeText(account)
                .then(() => {
                    // Optional: Show a temporary tooltip or notification
                    alert('Address copied to clipboard');
                })
                .catch(err => {
                    console.error('Failed to copy address:', err);
                    setError('Failed to copy address');
                });
        }
    };

    const handleAccountsChanged = useCallback(
        async (newAccounts: string[]) => {
            if (newAccounts.length > 0 && web3) {
                setAccount(newAccounts[0]);
                await updateAccountAndBalance(web3);
            } else {
                setAccount('');
                setBalance('0');
            }
        },
        [web3, updateAccountAndBalance]
    );

    const handleChainChanged = useCallback(() => {
        if (web3) {
            updateAccountAndBalance(web3);
        }
    }, [web3, updateAccountAndBalance]);

    const handleConnectWallet = async () => {
        if (connecting) return;
        setConnecting(true);
        try {
            await window.ethereum?.request({ method: 'eth_requestAccounts' });
            if (web3) {
                await updateAccountAndBalance(web3);
            }
        } catch (err: any) {
            setError('Failed to connect wallet.');
            console.error('Wallet connection error:', err);
        } finally {
            setConnecting(false);
        }
    };

    const handleContractAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const address = event.target.value;
        setContractAddress(address);
        if (web3 && !web3.utils.isAddress(address)) {
            setAddressError('Invalid Ethereum address.');
            setIsContractAddressValid(false);
        } else {
            setAddressError(null);
            setIsContractAddressValid(true);
        }
    };

    const handleDisconnect = () => {
        setAccount('');
        setBalance('0');
    };

    const handleTransfer = async () => {
        if (!tokenContract || !web3 || !account) return;
         if (!web3.utils.isAddress(recipientAddress)) {
            setError("Recipient address is invalid");
            return;
        }
        try {
            await tokenContract.methods.transferTokens(recipientAddress, web3.utils.toWei(transferAmount, 'ether')).send({ from: account });
            await updateAccountAndBalance(web3);
        } catch (err: any) {
            setError('Transfer failed.');
            console.error('Transfer error:', err);
        }
    };

    const handleMint = async () => {
        if (!tokenContract || !web3 || !account) return;
        try {
            await tokenContract.methods.mint(account, web3.utils.toWei(mintAmount, 'ether')).send({ from: account });
            await updateAccountAndBalance(web3);
        } catch (err: any) {
            setError('Mint failed.');
            console.error('Mint error:', err);
        }
    };

    return (
        <Container className="main-body mt-5 px-3">
            <h1 className="text-center mb-4 text-white">OSAA Token Platform</h1>

            {error && <Alert variant="danger" className="text-center">{error}</Alert>}
            {account && (
                <Row className="w-100 mx-auto rounded mb-3 text-white bg-dark bg-gradient">
                    <Col>
                        <div className="p-3 rounded">
                            <h5 className='m-0'>Balance</h5>
                            <h1 className='m-0'> {balance} <span className="text-medium">OSAA</span></h1>
                            <hr />
                            <h5>Wallet Address</h5>
                            <div className="text-sm border px-3 py-2 rounded d-flex justify-content-center position-relative">
                                <span>{account}</span>
                                <Button className="text-sm p-1 position-absolute top-0 start-100 translate-middle" onClick={handleCopyAddress} ><CopyIcon width={20} height={20} /></Button>
                            </div>
                            <Button variant="outline-danger" onClick={handleDisconnect} className="mt-4 text-white text-sm">Disconnect Wallet</Button>
                        </div>
                    </Col>
                </Row>
            )}
            {!account && (
                <div className="text-center">
                    <Button variant="primary" onClick={handleConnectWallet} disabled={connecting}>
                        {connecting ? 'Connecting...' : 'Connect Wallet'}
                    </Button>
                </div>
            )}
            <div className='w-100 bg-dark bg-gradient p-4 rounded py-3 mt-4'>

                <h5 className='text-white shadow-md m-0'>Want to start minting? Provide:</h5>
                <p className='text-sm text-light m-0'>Paste a contract address below:</p>
                <Form.Group>
                    <Form.Control
                        type="text"
                        placeholder="Contract Address"
                        onChange={handleContractAddressChange}
                        className={`mb-2 bg-dark border ${isContractAddressValid ? 'text-white' : 'is-invalid'}`}
                        isInvalid={!isContractAddressValid}
                    />
                    {addressError ?
                        <div className="alert alert-warning text-sm text-white">
                            {addressError}
                        </div>
                        : ''}
                </Form.Group>
            </div>


            {account && tokenContract && (
                <>
                    <div className="w-100 bg-dark bg-gradient rounded p-3 d-flex justify-content-start flex-column items-end">
                        <Form.Control type="text" placeholder="Recipient Address" onChange={(e) => setRecipientAddress(e.target.value)} className="mb-2 text-white bg-dark border" />
                        <Form.Control type="text" placeholder="Transfer Amount" onChange={(e) => setTransferAmount(e.target.value)} className="mb-2 text-white bg-dark border" />
                        <Button className="bg-black border" onClick={handleTransfer}>Transfer</Button>
                    </div>
                    <div className="w-100 bg-dark bg-gradient rounded p-3 d-flex justify-content-start flex-column items-end mt-2">
                        <Form.Control type="text" placeholder="Mint Amount" onChange={(e) => setMintAmount(e.target.value)} className="mb-2 bg-dark text-white border" />
                        <Button className="bg-black border" onClick={handleMint}>Mint</Button>
                    </div>
                </>
            )}
        </Container>
    );
};

export default App;
