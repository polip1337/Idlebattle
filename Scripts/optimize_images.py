import os
from PIL import Image
import sys
from datetime import datetime
import tempfile

def get_file_size(file_path):
    """Get file size in bytes"""
    return os.path.getsize(file_path)

def format_size(size_bytes):
    """Format size in bytes to human readable format"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f}{unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f}GB"

def get_image_info(img):
    """Get detailed information about an image"""
    info = {
        'format': img.format,
        'mode': img.mode,
        'size': img.size,
        'width': img.width,
        'height': img.height,
    }
    return info

def determine_optimal_format(img, original_format):
    """
    Determine the optimal format for the image based on its content.
    Returns (format, quality) tuple.
    """
    # If it's a PNG with transparency, keep it as PNG
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and img.info.get('transparency')):
        return 'PNG', None
    
    # If it's a PNG without transparency, try JPEG
    if original_format == 'PNG':
        return 'JPEG', 85
    
    # For JPEGs, keep as JPEG but optimize
    if original_format == 'JPEG':
        return 'JPEG', 85
    
    # Default to JPEG for other formats
    return 'JPEG', 85

def optimize_image(image_path, quality=85, max_size=(1920, 1080)):
    """
    Optimize an image by reducing its size and quality while maintaining aspect ratio.
    Only saves if the new file would be smaller.
    
    Args:
        image_path (str): Path to the image file
        quality (int): JPEG quality (1-100)
        max_size (tuple): Maximum width and height
    Returns:
        tuple: (original_size, new_size, was_optimized) in bytes
    """
    try:
        # Get original file size
        original_size = get_file_size(image_path)
        
        # Open the image
        with Image.open(image_path) as img:
            # Get original image info
            original_info = get_image_info(img)
            
            # Determine optimal format
            optimal_format, optimal_quality = determine_optimal_format(img, original_info['format'])
            
            # Convert to RGB if necessary (for JPEG)
            converted = False
            if optimal_format == 'JPEG' and img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
                converted = True
            
            # Calculate new dimensions while maintaining aspect ratio
            resized = False
            width, height = img.size
            if width > max_size[0] or height > max_size[1]:
                ratio = min(max_size[0] / width, max_size[1] / height)
                new_size = (int(width * ratio), int(height * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
                resized = True
            
            # Save to temporary file first to check size
            with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{optimal_format.lower()}') as temp_file:
                save_params = {'optimize': True}
                if optimal_quality is not None:
                    save_params['quality'] = optimal_quality
                img.save(temp_file.name, format=optimal_format, **save_params)
                new_size = get_file_size(temp_file.name)
            
            # Only replace original if new file is smaller
            if new_size < original_size:
                # Get new image info before moving
                with Image.open(temp_file.name) as new_img:
                    new_info = get_image_info(new_img)
                
                # Move temp file to original location
                os.replace(temp_file.name, image_path)
                
                # Calculate savings
                savings = original_size - new_size
                savings_percent = (savings / original_size) * 100
                
                print(f"\nOptimized: {image_path}")
                print(f"Original size: {format_size(original_size)}")
                print(f"New size: {format_size(new_size)}")
                print(f"Space saved: {format_size(savings)} ({savings_percent:.1f}%)")
                
                # Print detailed diagnostics
                print("\nImage Details:")
                print(f"Original format: {original_info['format']}, mode: {original_info['mode']}")
                print(f"New format: {new_info['format']}, mode: {new_info['mode']}")
                print(f"Original dimensions: {original_info['width']}x{original_info['height']}")
                print(f"New dimensions: {new_info['width']}x{new_info['height']}")
                
                if converted:
                    print("NOTE: Image was converted from RGBA/P to RGB mode")
                if resized:
                    print("NOTE: Image was resized")
                if original_info['format'] != new_info['format']:
                    print(f"NOTE: Format changed from {original_info['format']} to {new_info['format']}")
                
                print("-" * 50)
                return original_size, new_size, True
            else:
                # Clean up temp file
                os.unlink(temp_file.name)
                print(f"\nSkipped: {image_path} (optimization would increase size)")
                print(f"Original size: {format_size(original_size)}")
                print(f"Would be: {format_size(new_size)}")
                print("-" * 50)
                return original_size, original_size, False
            
    except Exception as e:
        print(f"Error processing {image_path}: {str(e)}")
        return 0, 0, False

def process_directory(directory):
    """
    Process all images in a directory and its subdirectories.
    
    Args:
        directory (str): Directory to process
    Returns:
        tuple: (total_original_size, total_new_size, processed_files, optimized_files) in bytes
    """
    # Supported image extensions
    image_extensions = ('.jpg', '.jpeg', '.png')
    
    total_original_size = 0
    total_new_size = 0
    processed_files = 0
    optimized_files = 0
    
    # Walk through all directories and files
    for root, _, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(image_extensions):
                image_path = os.path.join(root, file)
                original_size, new_size, was_optimized = optimize_image(image_path)
                total_original_size += original_size
                total_new_size += new_size
                processed_files += 1
                if was_optimized:
                    optimized_files += 1
    
    return total_original_size, total_new_size, processed_files, optimized_files

if __name__ == "__main__":
    # Get the Media directory path
    media_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Media")
    
    if not os.path.exists(media_dir):
        print(f"Error: Media directory not found at {media_dir}")
        sys.exit(1)
    
    print(f"Starting image optimization at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)
    
    total_original_size, total_new_size, processed_files, optimized_files = process_directory(media_dir)
    
    total_savings = total_original_size - total_new_size
    savings_percent = (total_savings / total_original_size) * 100 if total_original_size > 0 else 0
    
    print("\nOptimization Summary:")
    print("=" * 50)
    print(f"Total files processed: {processed_files}")
    print(f"Files optimized: {optimized_files}")
    print(f"Files skipped (no size reduction): {processed_files - optimized_files}")
    print(f"Total original size: {format_size(total_original_size)}")
    print(f"Total new size: {format_size(total_new_size)}")
    print(f"Total space saved: {format_size(total_savings)} ({savings_percent:.1f}%)")
    print(f"Optimization completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}") 