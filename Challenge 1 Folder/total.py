import datasets
from transformers import MBartForConditionalGeneration, MBart50TokenizerFast, Trainer, TrainingArguments
from sklearn.model_selection import train_test_split

# Load the dataset
dataset = datasets.load_dataset("SKNahin/bengali-transliteration-data")

# Split the dataset into training and validation subsets
train_data, val_data = train_test_split(dataset['train'], test_size=0.1)

# Tokenize the data
tokenizer = MBart50TokenizerFast.from_pretrained("facebook/mbart-large-50-many-to-many-mmt")

def tokenize_function(examples):
    inputs = [ex for ex in examples['banglish']]
    targets = [ex for ex in examples['bangla']]
    model_inputs = tokenizer(inputs, max_length=128, truncation=True)
    with tokenizer.as_target_tokenizer():
        labels = tokenizer(targets, max_length=128, truncation=True)
    model_inputs["labels"] = labels["input_ids"]
    return model_inputs

train_dataset = train_data.map(tokenize_function, batched=True)
val_dataset = val_data.map(tokenize_function, batched=True)

# Select a model
model = MBartForConditionalGeneration.from_pretrained("facebook/mbart-large-50-many-to-many-mmt")

# Training arguments
training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=3,
    weight_decay=0.01,
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
)

# Train the model
trainer.train()