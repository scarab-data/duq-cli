const fs = require('fs');
const path = require('path');

function processFiles(directory) {
  const files = fs.readdirSync(directory);
  
  let totalSize = 0;
  let largestFile = { name: '', size: 0 };
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isFile()) {
      totalSize += stats.size;
      
      if (stats.size > largestFile.size) {
        largestFile = { name: file, size: stats.size };
      }
      
      const extension = path.extname(file);
      if (['.js', '.json', '.txt'].includes(extension)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lineCount = content.split('\n').length;
        console.log(`${file}: ${lineCount} lines`);
      }
    }
  });
  
  return {
    fileCount: files.length,
    totalSize,
    largestFile,
    averageSize: totalSize / files.length
  };
}

function transformData(data) {
  const result = [];
  
  for (let i = 0; i < data.length; i++) {
    if (typeof data[i] === 'number') {
      result.push(data[i] * 2);
    } else if (typeof data[i] === 'string') {
      result.push(data[i].toUpperCase());
    } else if (Array.isArray(data[i])) {
      result.push(transformData(data[i]));
    }
  }
  
  return result;
}

class DataProcessor {
  constructor(initialData) {
    this.data = initialData || [];
    this.processed = false;
    this.timestamp = Date.now();
  }
  
  addItem(item) {
    this.data.push(item);
    this.processed = false;
    return this.data.length;
  }
  
  removeItem(index) {
    if (index >= 0 && index < this.data.length) {
      this.data.splice(index, 1);
      this.processed = false;
      return true;
    }
    return false;
  }
  
  process() {
    this.result = this.data.map(item => {
      if (typeof item === 'number') {
        return item * 3 + 2;
      }
      if (typeof item === 'string') {
        return item.split('').reverse().join('');
      }
      return item;
    });
    
    this.processed = true;
    this.timestamp = Date.now();
    return this.result;
  }
  
  getStats() {
    const numbers = this.data.filter(item => typeof item === 'number');
    const strings = this.data.filter(item => typeof item === 'string');
    
    return {
      total: this.data.length,
      numbers: numbers.length,
      strings: strings.length,
      other: this.data.length - numbers.length - strings.length,
      processed: this.processed,
      timestamp: this.timestamp
    };
  }
}

function fetchAndProcessData(url, options) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const mockData = {
        id: Math.floor(Math.random() * 1000),
        values: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)),
        metadata: {
          source: url,
          timestamp: Date.now(),
          options
        }
      };
      
      if (Math.random() > 0.2) {
        resolve(mockData);
      } else {
        reject(new Error('Failed to fetch data'));
      }
    }, 1500);
  });
}

async function main() {
  try {
    const currentDir = process.cwd();
    const stats = processFiles(currentDir);
    console.log('Directory stats:', stats);
    
    const testData = [1, 'hello', [3, 4], 'world', 10];
    const transformed = transformData(testData);
    console.log('Transformed data:', transformed);
    
    const processor = new DataProcessor([5, 10, 'test', 'example', 20]);
    processor.addItem('new item');
    processor.process();
    console.log('Processed result:', processor.result);
    console.log('Stats:', processor.getStats());
    
    const data = await fetchAndProcessData('https://api.example.com/data', { limit: 10 });
    console.log('Fetched data:', data);
  } catch (error) {
    console.error('Error in main function:', error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  processFiles,
  transformData,
  DataProcessor,
  fetchAndProcessData
};
