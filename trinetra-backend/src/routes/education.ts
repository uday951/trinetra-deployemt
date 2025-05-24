import express, { Request, Response } from 'express';
import { Education } from '../models/Education';

const router = express.Router();

// Add educational content
router.post('/content', async (req: Request, res: Response) => {
  try {
    const { title, description, type, url, tags } = req.body;
    
    if (!title || !description || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const content = await Education.create({
      title,
      description,
      type,
      url,
      tags: tags || []
    });

    res.status(201).json(content);
  } catch (error) {
    console.error('Error adding educational content:', error);
    res.status(500).json({ message: 'Failed to add educational content' });
  }
});

// Get articles
router.get('/articles', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const articles = await Education.find({ 
      type: 'article',
      ...(userId ? { userId } : {})
    }).sort({ createdAt: -1 });
    
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Failed to fetch articles' });
  }
});

// Get videos
router.get('/videos', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const videos = await Education.find({ 
      type: 'video',
      ...(userId ? { userId } : {})
    }).sort({ createdAt: -1 });
    
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
});

// Get educational content by type and tags
router.get('/content', async (req: Request, res: Response) => {
  try {
    const { type, tags } = req.query;
    let query: any = {};

    if (type) {
      query.type = type;
    }

    if (tags) {
      query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    const content = await Education.find(query).sort({ createdAt: -1 });
    res.json(content);
  } catch (error) {
    console.error('Error fetching educational content:', error);
    res.status(500).json({ message: 'Failed to fetch educational content' });
  }
});

// Update educational content
router.put('/content/:id', async (req: Request, res: Response) => {
  try {
    const { title, description, type, url, tags } = req.body;
    const content = await Education.findByIdAndUpdate(
      req.params.id,
      { title, description, type, url, tags },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    console.error('Error updating educational content:', error);
    res.status(500).json({ message: 'Failed to update educational content' });
  }
});

// Delete educational content
router.delete('/content/:id', async (req: Request, res: Response) => {
  try {
    const content = await Education.findByIdAndDelete(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting educational content:', error);
    res.status(500).json({ message: 'Failed to delete educational content' });
  }
});

export default router; 