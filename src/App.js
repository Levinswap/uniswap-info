import React, { Component } from "react";
import styled from "styled-components";
import { Box, Button, Flex, Text } from "rebass";

import Wrapper from "./components/Theme";
import Title from "./components/Title";
import FourByFour from "./components/FourByFour";
import Panel from "./components/Panel";
import Dashboard from "./components/Dashboard";
import Select from "./components/Select";
import Footer from "./components/Footer";
import TransactionsList from "./components/TransactionsList";
import Link from "./components/Link";
import Chart from "./components/Chart";

import { urls } from "./helpers/";

import axios from "axios";

// all our exchange options keyed by exchange address
let exchangeDataRaw = {};
let exchangeSelectOptions = [];

let currentExchangeSymbol;
let app;

const Address = props => (
  <Link {...props} color="button" external style={{ wordBreak: "break-all" }}>
    {props.children}
  </Link>
);

const Header = styled(Panel)`
  display: grid;
  grid-template-columns: 1fr 216px;
  align-items: center;
`;

const Divider = styled(Box)`
  height: 1px;
  background-color: rgba(43, 43, 43, 0.05);
`;

const Hint = props => (
  <Text {...props} fontSize={12}>
    {props.children}
  </Text>
);

const timeframeOptions = [
  { value: "day", label: "1 day" },
  { value: "week", label: "1 week" },
  { value: "month", label: "1 month" }
];

class App extends Component {
  constructor(props) {
    super(props);

    app = this;
  }

  getExchangeData(exchange_address) {
    return exchangeDataRaw[exchange_address];
  }

  componentDidMount(props) {
    // Load exchange list
    axios({
      method: "get",
      url: "http://uniswap-analytics.appspot.com/api/v1/directory",      
    }).then(response => {
      // TODO set this in config
      var defaultExchangeAddress = "";

      response.data.forEach(function(exchange) {
        var symbol = exchange["symbol"];
        var exchange_address =  exchange["exchangeAddress"];
        var token_address = exchange["tokenAddress"];
        var token_decimals = exchange["tokenDecimals"];

        exchangeSelectOptions.push({        
          label : (symbol + " - " + exchange_address),          
          value : exchange_address
        });

        exchangeDataRaw[exchange_address] = {
          symbol : symbol,
          exchangeAddress : exchange_address,
          tokenAddress : token_address,
          tokenDecimals : token_decimals
        };

        defaultExchangeAddress = exchange_address;
      });      

      this.setState({})

      this.retrieveExchangeHistory(defaultExchangeAddress);
    });      
  }

  retrieveExchangeHistory(exchange_address) {
    // load exchange history
    // by default, get exchange history for past 30 days
    var utcEndTimeInSeconds = Date.now() / 1000;
    var utcStartTimeInSeconds = utcEndTimeInSeconds - (60 * 60 * 24 * 30);

    console.log(utcEndTimeInSeconds);
    axios({
      method: "get",
      url: "http://uniswap-analytics.appspot.com/api/v1/history?exchangeAddress=" + exchange_address + 
      "&startTime=" + utcStartTimeInSeconds + "&endTime=" + utcEndTimeInSeconds,
    }).then(response => {
      // TODO parse history into buckets segmented by day
      console.log(response.data);
    });
  }

  render() {
    if (exchangeSelectOptions.length === 0) {
      // TODO Show loading indicator
      return (
        <Wrapper/>
      );
    } else {
      return (
        <Wrapper>
          <Header
            px={24}
            py={3}
            bg={["mineshaft", "transparent"]}
            color={["white", "black"]}
          >
            <Title />
            <Select options={exchangeSelectOptions} onChange={(newOption)=>{            
              var exchangeData = app.getExchangeData(newOption.value);

              currentExchangeSymbol = exchangeData.symbol;

              app.setState({});

              app.retrieveExchangeHistory(exchangeData.exchangeAddress);
            }}
            />
          </Header>

          <Dashboard mx="auto" px={[0, 3]}>
            <Box style={{ gridArea: "volume" }}>
              <Panel grouped rounded color="white" bg="jaguar" p={24}>
                <FourByFour
                  gap={24}
                  topLeft={<Hint color="textLightDim">{currentExchangeSymbol} Volume</Hint>}
                  bottomLeft={
                    <Text fontSize={24} lineHeight={1.4} fontWeight={500}>
                      130.83 ETH
                    </Text>
                  }
                  topRight={<Hint color="textLightDim">24h</Hint>}
                  bottomRight={
                    <Text fontSize={20} lineHeight={1.4}>
                      +2.01%
                    </Text>
                  }
                />
              </Panel>
              <Panel grouped rounded color="white" bg="maker" p={24}>
                <FourByFour
                  topLeft={<Hint color="textLight">Your share</Hint>}
                  bottomLeft={
                    <Text fontSize={20} lineHeight={1.4} fontWeight={500}>
                      47 Pool Tokens
                    </Text>
                  }
                  bottomRight={
                    <Text fontSize={20} lineHeight={1.4}>
                      2.5%
                    </Text>
                  }
                />
                <FourByFour
                  mt={3}
                  topLeft={<Hint color="textLight">Your fees</Hint>}
                  bottomLeft={
                    <Text fontSize={20} lineHeight={1.4} fontWeight={500}>
                      0.0841 DAI
                    </Text>
                  }
                  bottomRight={
                    <Text fontSize={20} lineHeight={1.4}>
                      -0.0004 ETH
                    </Text>
                  }
                />
              </Panel>
            </Box>

            <Panel rounded p={24} bg="white" area="liquidity">
              <FourByFour
                topLeft={<Hint>{currentExchangeSymbol} Liquidity</Hint>}
                bottomLeft={
                  <Text fontSize={20} color="maker" lineHeight={1.4} fontWeight={500}>
                    42561.31 DAI
                  </Text>
                }
                topRight={<Hint>ETH Liquidity</Hint>}
                bottomRight={
                  <Text
                    fontSize={20}
                    color="uniswappink"
                    lineHeight={1.4}
                    fontWeight={500}
                  >
                    419.27 ETH
                  </Text>
                }
              />
            </Panel>

            <Panel rounded bg="white" area="statistics">
              <Box p={24}>
                <Flex alignItems="center" justifyContent="space-between">
                  <Text>Pool Statistics</Text>
                  <Box width={144}>
                    <Select
                      placeholder="..."
                      options={timeframeOptions}
                    />
                  </Box>
                </Flex>
              </Box>
              <Divider />

              <Box p={24}>
                <Chart />
              </Box>
            </Panel>

            <Panel rounded bg="white" area="exchange">
              <Box p={24}>
                <Hint color="textSubtext" mb={3}>
                  Exchange Address
                </Hint>
                <Address
                  href={urls.showAddress(
                    "0x09cabec1ead1c0ba254b09efb3ee13841712be14"
                  )}
                >
                  0x09cabec1ead1c0ba254b09efb3ee13841712be14
                </Address>
              </Box>

              <Box p={24}>
                <Hint color="textSubtext" mb={3}>
                  Token Address
                </Hint>
                <Address
                  href={urls.showAddress(
                    "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359"
                  )}
                >
                  0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359
                </Address>
              </Box>
            </Panel>

            <Panel rounded bg="white" area="transactions">
              <Flex p={24} justifyContent="space-between">
                <Text color="text">Latest Transactions</Text>
                <Text>↓</Text>
              </Flex>
              <Divider />
              <TransactionsList />
            </Panel>
          </Dashboard>

          <Footer />
        </Wrapper>
      )
    }
  }
}

export default App;
