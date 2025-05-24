import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import Header from '@/components/Header';
import SectionTitle from '@/components/SectionTitle';
import { BookOpen, Video, FileText } from 'lucide-react-native';

export default function EducationScreen() {
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <View style={styles.container}>
      <Header title="Trinetra Security" />
      <SectionTitle title="Education" />
      
      <View style={styles.hubHeader}>
        <Text style={styles.hubTitle}>Cyber Education Hub</Text>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]} 
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'articles' && styles.activeTab]} 
          onPress={() => setActiveTab('articles')}
        >
          <Text style={[styles.tabText, activeTab === 'articles' && styles.activeTabText]}>Articles</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'videos' && styles.activeTab]} 
          onPress={() => setActiveTab('videos')}
        >
          <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>Videos</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4169E1" />
        </View>
      ) : (
        <ScrollView style={styles.contentScroll}>
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>Featured</Text>
            
            <TouchableOpacity style={styles.featuredCard}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg' }} 
                style={styles.featuredImage} 
              />
              <View style={styles.featuredOverlay}>
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredTitle}>Cybersecurity Basics: Protecting Your Digital Life</Text>
                  <View style={styles.featuredMeta}>
                    <Text style={styles.featuredType}>Series</Text>
                    <Text style={styles.featuredDuration}>10 min read</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.articlesSection}>
            <Text style={styles.sectionTitle}>Recent Articles</Text>
            
            <TouchableOpacity style={styles.contentCard}>
              <View style={styles.contentIconContainer}>
                <FileText size={24} color="#4169E1" />
              </View>
              <View style={styles.contentInfo}>
                <Text style={styles.contentTitle}>Understanding Phishing Attacks</Text>
                <Text style={styles.contentExcerpt}>
                  Learn how to identify and protect yourself from phishing attempts.
                </Text>
                <View style={styles.contentMeta}>
                  <Text style={styles.contentCategory}>Security</Text>
                  <Text style={styles.contentTime}>5 min read</Text>
                </View>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contentCard}>
              <View style={styles.contentIconContainer}>
                <FileText size={24} color="#4169E1" />
              </View>
              <View style={styles.contentInfo}>
                <Text style={styles.contentTitle}>Secure Password Practices</Text>
                <Text style={styles.contentExcerpt}>
                  Tips for creating and managing strong, unique passwords.
                </Text>
                <View style={styles.contentMeta}>
                  <Text style={styles.contentCategory}>Passwords</Text>
                  <Text style={styles.contentTime}>7 min read</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.videosSection}>
            <Text style={styles.sectionTitle}>Video Tutorials</Text>
            
            <TouchableOpacity style={styles.videoCard}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg' }} 
                style={styles.videoThumbnail} 
              />
              <View style={styles.playButton}>
                <Video size={24} color="#fff" />
              </View>
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>How to Secure Your Home Wi-Fi Network</Text>
                <Text style={styles.videoDuration}>4:32</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.videoCard}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/6804601/pexels-photo-6804601.jpeg' }} 
                style={styles.videoThumbnail} 
              />
              <View style={styles.playButton}>
                <Video size={24} color="#fff" />
              </View>
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>Child Safety Online: Parental Controls Guide</Text>
                <Text style={styles.videoDuration}>6:15</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.topicsSection}>
            <Text style={styles.sectionTitle}>Popular Topics</Text>
            
            <View style={styles.topicsGrid}>
              <TouchableOpacity style={styles.topicCard}>
                <View style={styles.topicIcon}>
                  <BookOpen size={24} color="#4169E1" />
                </View>
                <Text style={styles.topicTitle}>Password Security</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.topicCard}>
                <View style={styles.topicIcon}>
                  <BookOpen size={24} color="#4169E1" />
                </View>
                <Text style={styles.topicTitle}>Online Privacy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.topicCard}>
                <View style={styles.topicIcon}>
                  <BookOpen size={24} color="#4169E1" />
                </View>
                <Text style={styles.topicTitle}>Safe Browsing</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.topicCard}>
                <View style={styles.topicIcon}>
                  <BookOpen size={24} color="#4169E1" />
                </View>
                <Text style={styles.topicTitle}>Child Safety</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  hubHeader: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  hubTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#4169E1',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentScroll: {
    flex: 1,
  },
  featuredSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  featuredCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featuredType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredDuration: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#fff',
  },
  articlesSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  contentCard: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  contentExcerpt: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4169E1',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  contentTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888',
  },
  videosSection: {
    padding: 16,
    marginTop: 16,
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  videoThumbnail: {
    width: '100%',
    height: 160,
  },
  playButton: {
    position: 'absolute',
    top: 80 - 24,
    left: '50%',
    marginLeft: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(65, 105, 225, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  videoDuration: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888',
  },
  topicsSection: {
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  topicCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topicIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    textAlign: 'center',
  },
});