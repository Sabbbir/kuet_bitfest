import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, Seq2SeqTrainingArguments, Seq2SeqTrainer
from datasets import load_dataset

# Load Dataset
dataset = load_dataset("SKNahin/bengali-transliteration-data")

data = dataset['train'].train_test_split(test_size=0.1, seed=42)
train_data = data['train']
val_data = data['test']

# Preprocessing
model_name = "google/mt5-small"
tokenizer = AutoTokenizer.from_pretrained(model_name)


def preprocess_function(examples):
    inputs = [ex for ex in examples["bn"]]
    targets = [ex for ex in examples["rm"]]
    model_inputs = tokenizer(inputs, max_length=128,
                             truncation=True, padding=True)
    with tokenizer.as_target_tokenizer():
        labels = tokenizer(targets, max_length=128,
                           truncation=True, padding=True)
    model_inputs["labels"] = labels["input_ids"]
    return model_inputs


train_dataset = train_data.map(
    preprocess_function, batched=True, remove_columns=train_data.column_names)
val_dataset = val_data.map(
    preprocess_function, batched=True, remove_columns=val_data.column_names)

# Load Model
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# Training Arguments
training_args = Seq2SeqTrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",
    learning_rate=5e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=3,
    weight_decay=0.01,
    save_total_limit=3,
    predict_with_generate=True,
    logging_dir="./logs",
    load_best_model_at_end=True,
    fp16=torch.cuda.is_available(),
)

# Trainer
trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    tokenizer=tokenizer,
)

# Train
trainer.train()

# Save the model
model.save_pretrained("./banglish_to_bangla_model")
tokenizer.save_pretrained("./banglish_to_bangla_model")
