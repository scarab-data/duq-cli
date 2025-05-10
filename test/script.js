/**
 * File system module for file operations
 * @module fs
 */
const fs = require('fs');

/**
 * Path module for handling file paths
 * @module path
 */
const path = require('path');

/**
 * Processes all files in a directory and collects statistics
 * 
 * @param {string} directory - The path to the directory to process
 * @returns {Object} Statistics about the processed files
 * @returns {number} returns.fileCount - Total number of files in the directory
 * @returns {number} returns.totalSize - Combined size of all files in bytes
 * @returns {Object} returns.largestFile - Information about the largest file
 * @returns {string} returns.largestFile.name - Name of the largest file
 * @returns {number} returns.largestFile.size - Size of the largest file in bytes
 * @returns {number} returns.averageSize - Average file size in bytes
 */
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

/**
 * Transforms data elements based on their type:
 * - Numbers are multiplied by 2
 * - Strings are converted to uppercase
 * - Arrays are recursively transformed
 * - Other types are ignored
 * 
 * @param {Array} data - The array of mixed data types to transform
 * @returns {Array} A new array with transformed values
 */
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

/**
 * Class for processing and transforming data collections
 */
class DataProcessor {
  /**
   * Creates a new DataProcessor instance
   * 
   * @param {Array} initialData - Initial data array to process (optional)
   */
  constructor(initialData) {
    this.data = initialData || [];
    this.processed = false;
    this.timestamp = Date.now();
  }
  
  /**
   * Adds a new item to the data collection
   * 
   * @param {*} item - The item to add to the collection
   * @returns {number} The new length of the data collection
   */
  addItem(item) {
    this.data.push(item);
    this.processed = false;
    return this.data.length;
  }
  
  /**
   * Removes an item at the specified index
   * 
   * @param {number} index - The index of the item to remove
   * @returns {boolean} True if item was successfully removed, false otherwise
   */
  removeItem(index) {
    if (index >= 0 && index < this.data.length) {
      this.data.splice(index, 1);
      this.processed = false;
      return true;
    }
    return false;
  }
  
  /**
   * Processes the data collection by applying transformations:
   * - Numbers: multiplied by 3 and add 2
   * - Strings: reversed
   * - Other types: unchanged
   * 
   * @returns {Array} The processed data array
   */
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
  
  /**
   * Gets statistics about the current data collection
   * 
   * @returns {Object} Statistics about the data collection
   * @returns {number} returns.total - Total number of items
   * @returns {number} returns.numbers - Count of number items
   * @returns {number} returns.strings - Count of string items
   * @returns {number} returns.other - Count of other type items
   * @returns {boolean} returns.processed - Whether the data has been processed
   * @returns {number} returns.timestamp - Timestamp of last processing
   */
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

/**
 * Simulates fetching and processing data from a remote API
 * 
 * @param {string} url - The URL to fetch data from
 * @param {Object} options - Options for the fetch request
 * @returns {Promise<Object>} A promise that resolves to the fetched and processed data
 * @throws {Error} If the fetch operation fails (20% chance of failure)
 */
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

/**
 * Main function that demonstrates the usage of all other functions
 * 
 * @async
 * @returns {Promise<void>}
 */
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

/**
 * Check if this file is being run directly (not imported)
 * and execute the main function if it is
 */
if (require.main === module) {
  main().catch(console.error);
}

/**
 * Export the public API of this module
 */
module.exports = {
  processFiles,
  transformData,
  DataProcessor,
  fetchAndProcessData
};
