import { Alert } from 'react-native';
import spamCallService from './spamCallService';

class CallSimulator {
  private testNumbers = [
    { number: '+1234567890', isSpam: true, reason: 'Known spam number' },
    { number: '+91987654321', isSpam: true, reason: 'High-risk location' },
    { number: '+14155552671', isSpam: false, reason: 'Legitimate US number' },
    { number: '+442071234567', isSpam: false, reason: 'UK landline' },
    { number: '+8801712345678', isSpam: true, reason: 'Suspicious carrier' }
  ];

  async simulateIncomingCall(phoneNumber?: string) {
    const testNumber = phoneNumber || this.getRandomTestNumber();
    
    try {
      // Check with real NumVerify API
      const spamCheck = await spamCallService.checkPhoneNumber(testNumber);
      
      // Show Truecaller-like popup
      this.showCallAlert(testNumber, spamCheck);
      
      return spamCheck;
    } catch (error) {
      console.error('Call simulation failed:', error);
      Alert.alert('Error', 'Failed to simulate call');
    }
  }

  private getRandomTestNumber() {
    const randomIndex = Math.floor(Math.random() * this.testNumbers.length);
    return this.testNumbers[randomIndex].number;
  }

  private showCallAlert(phoneNumber: string, spamInfo: any) {
    if (spamInfo.isSpam) {
      Alert.alert(
        '🚨 SPAM CALL DETECTED',
        `Incoming call from:\n${phoneNumber}\n\nRisk Level: ${spamInfo.riskLevel.toUpperCase()}\nReason: ${spamInfo.reason}\n\n${spamInfo.phoneInfo ? `Country: ${spamInfo.phoneInfo.country_name}\nCarrier: ${spamInfo.phoneInfo.carrier}` : ''}`,
        [
          {
            text: 'Block & Reject',
            style: 'destructive',
            onPress: () => {
              spamCallService.blockNumber(phoneNumber);
              Alert.alert('Blocked', `${phoneNumber} has been blocked`);
            }
          },
          {
            text: 'Answer Anyway',
            style: 'default'
          },
          {
            text: 'Whitelist',
            onPress: () => {
              spamCallService.allowNumber(phoneNumber);
              Alert.alert('Whitelisted', `${phoneNumber} has been whitelisted`);
            }
          }
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert(
        '📞 Incoming Call',
        `${phoneNumber}\n\n${spamInfo.phoneInfo ? `Country: ${spamInfo.phoneInfo.country_name}\nCarrier: ${spamInfo.phoneInfo.carrier}\nType: ${spamInfo.phoneInfo.line_type}` : 'Verified number'}`,
        [
          { text: 'Answer', style: 'default' },
          { text: 'Decline', style: 'cancel' },
          {
            text: 'Block',
            style: 'destructive',
            onPress: () => spamCallService.blockNumber(phoneNumber)
          }
        ]
      );
    }
  }

  // Test with specific scenarios
  async testSpamScenario() {
    await this.simulateIncomingCall('+91987654321'); // High-risk India number
  }

  async testLegitimateScenario() {
    await this.simulateIncomingCall('+14155552671'); // US number
  }

  async testUnknownScenario() {
    await this.simulateIncomingCall('+999999999999'); // Invalid number
  }
}

export default new CallSimulator();